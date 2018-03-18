import { Db } from 'mongodb'
import { Client } from 'elasticsearch'
import * as Moment from 'moment'
import {
  createIndex,
  bulkImportIntoEs,
} from './es'
import {
  processStream,
  bufferedStream,
} from './stream'
import {
  streamToLocalDb,
  getByIds,
  byIdsPredicate,
  exportResource,
} from './db'
import {
  exportWorkspaces,
} from './workspaces'
import {
  exportTasklists,
} from './tasklists'
import { exportUsers } from './users'
import { exportProjects } from './projects'
import { exportTags } from './tags'
import * as Fs from 'fs'

export async function exportTasks (remote: Db, local: Db, opts: ExportTasksOptions = { }) {
  let predicate: any = {
    is_deleted: false,
  }
  if (opts.from) {
    predicate.created = { $gt: Moment(opts.from, 'YYYY-MM-DD').toDate() }
  }

  let limit = opts.limit ? parseInt(opts.limit, 10) : 1000

  if (opts.ids) {
    Object.assign(predicate, byIdsPredicate(opts.ids))
    limit = 0
  }

  console.log('Exporting tasks ' + (opts.from ? `from ${opts.from} ` : '') + '(limit: ' + limit + ') ..')

  const count = await remote.collection('tasks').find(predicate).count()
  console.log(`Found ${count} tasks.`)

  await exportResource({
    remote,
    local,
    collection: 'tasks',
    predicate,
    fields: {
      space_id: 1,
      title: 1,
      description: 1,
      owner_id: 1,
      status: 1,
      updated: 1,
      created: 1,
      members: 1,
      due_date: 1,
      start_date: 1,
      completed_date: 1,
      tags: 1,
      checklist: 1,
    },
    sort: { _id: -1 },
    limit,
    transform: transformTasks(),
  })
}

export function transformTasks () {
  return d => {
    d.assignees = d.members.filter(x => x.is_assignee === true).map(x => x._id)
    d.followers = d.members.filter(x => x.is_assignee === false).map(x => x._id)
    delete d.members

    d.project_id = null
    d.tasklist_id = null

    return d
  }
}

export async function exportTasksMetadata (remote: Db, local: Db, onlyTaskIds?: string[]) {
  const predicate = onlyTaskIds ? byIdsPredicate(onlyTaskIds) : null
  console.log(
    'Exporting tasks metadata',
    onlyTaskIds ? `for ${onlyTaskIds.length} task ids.` : `for all tasks.`
  )

  let done = false
  let skip = 0
  let limit = 30000

  while (!done) {
    console.log(`Loading tasks @ ${skip} ..`)

    const read = local.collection('tasks').find(predicate)
    .project({ _id: 1, space_id: 1, tags: 1 })
    .skip(skip)
    .limit(limit)

    const workspaceIds = new Set()
    const tagIds = new Set()
    const taskIds = new Set()

    await processStream(read, d => {
      taskIds.add(d._id.toString())
      d.tags.forEach(x => tagIds.add(x))
      workspaceIds.add(d.space_id)
    })

    if (!taskIds.size) break

    console.log(`Loaded ${taskIds.size} task ids.`)
    console.log(`Loaded ${workspaceIds.size} workspace ids.`)
    console.log(`Loaded ${tagIds.size} tag ids.`)

    await exportTags(remote, local, [...tagIds.values()])

    const { userIds } = await exportWorkspaces(remote, local, [...workspaceIds.values()])
    await exportUsers(remote, local, userIds)

    const { projectIds } = await exportTasklists(remote, local, [...taskIds.values()])
    await exportProjects(remote, local, projectIds)

    skip += taskIds.size
  }
}

function toMap (arr) {
  return arr.reduce((acc, x) => {
    acc[x._id.toString()] = x
    return acc
  }, { })
}

function getUsers (local: Db, tasks: any[]) {
  // Gather task assignees and owners.
  const userIds = new Set()
  tasks.forEach(x => {
    userIds.add(x.owner_id)
    x.assignees.forEach(y => userIds.add(y))
  })
  return getByIds(local, 'users', [...userIds.values()], null)
}

function getTags (local: Db, tasks: any[]) {
  // Gather task tags.
  const tagIds = new Set()
  tasks.forEach(x => {
    x.tags.forEach(y => tagIds.add(y))
  })
  return getByIds(local, 'tags', [...tagIds.values()], null)
}

function getTasklists (local: Db, tasks: any[]): Promise<any[]> {
  // Gather tasklists.
  const taskIds = tasks.map(x => x._id.toString())
  return local.collection('tasklists')
  .find({ tasks: { $in: taskIds } })
  .toArray()
}

export async function joinTasksMetadata (local: Db) {
  const errors: any = []

  // Make sure we have an index on tasklists.tasks.
  await local.collection('tasklists').createIndex({ tasks: 1 })

  const beforeFlush = async tasks => {
    const users = await getUsers(local, tasks)    
    const usersMap = toMap(users)

    const tags = await getTags(local, tasks)
    const tagsMap = toMap(tags)

    const tasklists = await getTasklists(local, tasks)
    const tasklistsMap = toMap(tasklists)

    // Create task to tasklist and project lookup maps.
    const tasksToTasklists: any = { }
    const tasksToProjects: any = { }
    const projectIds = new Set()
    tasklists.forEach(x => {
      const id = x._id.toString()
      x.tasks.forEach(y => {
        projectIds.add(x.project_id)
        tasksToProjects[y] = x.project_id 
        tasksToTasklists[y] = id
      })
    })

    const projects = await getByIds(local, 'projects', [...projectIds.values()], null)
    const projectsMap = toMap(projects)
    
    console.log(
      `Fetched ${projects.length} projects, ${tasklists.length} tasklists, ` +
      `${users.length} users and ${tags.length} tags.`
    )

    const access = new Set()
    const userInfo = new Set()
    const tagInfo = new Set()
  
    tasks.forEach(t => {
      const taskId = t._id.toString()
      
      access.clear()
      userInfo.clear()
      tagInfo.clear()

      // Create default access set.
      // Grant access to task owner, assignees and followers.
      access.add(t.owner_id)
      t.assignees.forEach(x => access.add(x))
      t.followers.forEach(x => access.add(x))

      // Join tags.
      t.tags.forEach(x => {
        const tag = tagsMap[x]
        if (tag) {
          tagInfo.add(tag.name)
          tagInfo.add('tag-color-' + tag.color)
        }
      }) 

      // Join tasklist.
      const tasklistId = tasksToTasklists[taskId]
      const tasklist = tasklistsMap[tasklistId]
      t.tasklist_id = null
      t.tasklist_title = null
      if (!tasklist) {
        errors.push({ error: 'task missing tasklist', task: t })
      } else {
        t.tasklist_id = tasklist._id.toString()
        t.tasklist_title = tasklist.title
      }

      // Add user info to allow searching tasks by
      // user email and full name.
      const owner = usersMap[t.owner_id]
      if (owner) {
        userInfo.add(owner.name)
        userInfo.add(owner.email)
      }
      t.assignees.forEach(x => {
        const user = usersMap[x]
        if (user) {
          userInfo.add(user.name)
          userInfo.add(user.email)
        }
      })

      // Join project.
      const projectId = tasksToProjects[taskId]
      const project = projectsMap[projectId]
      t.project_id = null
      t.project_title = null
      if (project) {
        t.project_id = project._id.toString()
        t.project_title = project.title

        // Include project's access rights.
        if (project.is_private === false) {
          access.add('PUBLIC')
        } else {
          // Private project tasks are always visible to project
          // owner and all admins.
          access.add('PRIVATE')
          access.add(project.owner_id)
          project.admins.forEach(x => access.add(x))

          if (project.permissions === 0 || project.permissions === 1) {
            // Private project with permission level 0 or 1.
            // All projects member should be able to see all tasks.
            project.members.forEach(x => access.add(x))
          } else {
            access.add('RESTRICTED')
            // Private priject with restricted access.
            // Tasks are only visible to their assignees and followers.
          }
        }
      }
      
      t.access = [...access.values()]
      t.user_info = [...userInfo.values()].join(' ')
      t.tag_info = [...tagInfo.values()].join(' ')
    })
  }

  // Stream through all tasks in local db.
  const cursor = local.collection('tasks').find()
  
  await streamToLocalDb(cursor, local, 'tasks_full', null, true, beforeFlush)

  if (errors.length) {
    Fs.writeFileSync('/tmp/join-errors.json', JSON.stringify(errors, null, 2))
  }
}

export async function confirmJoinErrors (remote: Db) {
  const errors = require('/tmp/join-errors.json')
  console.log(`Loaded ${errors.length} join errors.`)

  let found
  for (const e of errors) {
    if (e.error === 'task missing tasklist') {
      found = await remote.collection('tasklists')
      .find({
        $or: [
          { tasks: e.task._id },
          { deleted_tasks: e.task._id },
        ]
      })
      .count()
      console.log(`Checking task ${e.task._id} in remote tasklists: ${found}`)
    }
  }
}

export async function importTasks (client: Client, local: Db, taskIds: string[] | null) {
  const index = 'tw_tasks'
  const type = 'task'

  await createIndex(client, index, getTwTasksIndexBody())

  const predicate = taskIds ? byIdsPredicate(taskIds) : null
  const cursor = local.collection('tasks_full').find(predicate)
  
  let showExample = true
  const onFlush = async (docs: any[], count: number) => {
    console.log(`Importing task ${count} in ES ..`)
    if (showExample) {
      console.log('Example:', JSON.stringify(docs[0], null, 2))
      showExample = false
    }
    await bulkImportIntoEs(client, index, type, docs)
  }

  await bufferedStream(cursor, onFlush, 5000)
}

function dateType () {
  return { 'type': 'date', 'format': 'strict_date_optional_time||epoch_millis' }
}

function getTwTasksIndexBody () {
  return {
    'mappings': {
      'task': {
        'properties': {
          'owner_id':             { 'type': 'keyword' },
          'space_id':             { 'type': 'keyword' },
          'title':                { 'type': 'text' },
          'description':          { 'type': 'text' },
          'status':               { 'type': 'long' },
          'assignees':            { 'type': 'keyword' },
          'followers':            { 'type': 'keyword' },
          'project_id':           { 'type': 'keyword' },
          'tasklist_id':          { 'type': 'keyword' },
          'created':              dateType(),
          'updated':              dateType(),
          'due_date':             dateType(),
          'start_date':           dateType(),
          'completed_date':       dateType(),
          'tags':                 { 'type': 'keyword' },
          'checklist':            { 'type': 'object' },
          'project_title':        { 'type': 'text' },
          'tasklist_title':       { 'type': 'text' },
          'access':               { 'type': 'keyword' },
          'user_info':            { 'type': 'text' },
          'tag_info':             { 'type': 'text' },
        },
      },
    },
  }
}

interface ExportTasksOptions {
  from?:  string,
  limit?: string,
  index?: string,
  file?:  string,
  ids?:   string[],
}
