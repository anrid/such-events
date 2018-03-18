import * as Assert from 'assert'
import { Db } from 'mongodb'
import * as Moment from 'moment'
import { processStream } from './stream'
import {
  getByIds,
} from './db'
import {
  exportTasks,
  joinTasksMetadata,
} from './tasks'
import { exportProjects } from './projects'
import { exportTasklists } from './tasklists'
import { exportUsers } from './users'
import { exportWorkspaces } from './workspaces'

const R = {
  WORKSPACES: { event: 'workspace', collection: 'workspaces' },
  PROJECTS:   { event: 'project', collection: 'projects' },
  CHANNELS:   { event: 'channel', collection: 'channels' },
  TASKLISTS:  { event: 'tasklist', collection: 'tasklists' },
  TASKS:      { event: 'task', collection: 'tasks' },
  MESSAGES:   { event: 'message', collection: 'messages' },
  USERS:      { event: 'user', collection: 'users' },
}

export async function updateTasks (remote: Db, local: Db, opts: any) {
  let resources = [
    R.TASKS,
    R.PROJECTS,
    R.TASKLISTS,
    R.USERS,
    R.WORKSPACES,
  ]

  if (opts.preview) {
    console.log('Preview events mode !')
    resources = Object.keys(R).map(x => R[x])
  }
  
  const ids = await getUpdatedResourcesSince(remote, resources, opts)

  if (opts.preview) return

  if (ids.tasks && ids.tasks.length) {
    console.log(`Updating ${ids.tasks.length} tasks ..`)
    await exportTasks(remote, local, { ids: ids.tasks })
  }

  const promises = []

  if (ids.projects && ids.projects.length) {
    console.log(`Updating ${ids.projects.length} projects ..`)
    promises.push(exportProjects(remote, local, ids.projects))
  }

  if (ids.tasklists && ids.tasklists.length) {
    console.log(`Updating ${ids.tasklists.length} tasklists ..`)
    promises.push(exportTasklists(remote, local, ids.tasklists))
  }

  if (ids.users && ids.users.length) {
    console.log(`Updating ${ids.users.length} users ..`)
    promises.push(exportUsers(remote, local, ids.users))
  }

  if (ids.workspaces && ids.workspaces.length) {
    console.log(`Updating ${ids.workspaces.length} workspaces ..`)
    promises.push(exportWorkspaces(remote, local, ids.workspaces))
  }

  // Wait for it ... !
  await Promise.all(promises)

  // Join it all together.
  await joinTasksMetadata(local)

}

export async function getUpdatedResourcesSince (remote: Db, resources: any[], opts: any) {
  Assert(opts.from, 'Missing --from option')

  const eventPattern = '^(' + resources.map(x => x.event).join('|') + '):'
  const fromDate = Moment(opts.from, 'YYYY-MM-DD HH:mm').toDate()
  const predicate = {
    created: { $gt: fromDate },
    $and: [
      { event: new RegExp(eventPattern) },
      { event: { $not: /:get/ } },
    ]
  }
  const limit = opts.limit ? parseInt(opts.limit, 10) : 10000
  console.log(`Finding events since ${opts.from} (limit: ${limit}) ..`)
  console.log('Matching pattern:', eventPattern)

  if (opts.preview) {
    const cursor1 = remote.collection('audits').aggregate([
      { $match: predicate },
      { $project: { event: 1 } },
      { $group: {
        _id: '$event',
        count: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
    ])
    
    console.log(`Preview of events:`)
    console.log(`==================`)
    await processStream(cursor1, d => {
      console.log(`${d._id} — ${d.count}`)
    })
    return
  }

  const count = await remote.collection('audits').find(predicate).count()
  console.log(`Found ${count} audit log entries.`)

  const cursor2 = remote.collection('audits').aggregate([
    { $match: predicate },
    { $limit: limit },
    { $project: { r1: 1 } },
    { $group: {
      _id: '$r1',
      count: { $sum: 1 },
    } },
    { $sort: { count: -1 } },
  ])
  
  const resourceIds = []
  await processStream(cursor2, d => {
    if (d._id && d._id.length === 24) resourceIds.push(d._id)
  })
  console.log(`Found ${resourceIds.length} resource ids.`)

  const result: any = { }
  for (const r of resources) {
    const docs = await getByIds(remote, r.collection, resourceIds, { _id: 1 })
    result[r.collection] = docs.map(x => x._id.toString()) 
    console.log(`Found ${docs.length} ${r.collection}.`)
  }
  return result
}
