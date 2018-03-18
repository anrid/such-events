import { Db } from 'mongodb'
import { exportResource } from './db'
import { bufferedStream } from './stream'

export async function exportTasklists (remote: Db, local: Db, taskIds: string[]) {
  const projectIds = new Set()

  await exportResource({
    remote,
    collection: 'tasklists',
    predicate: {
      $or: [
        { tasks: { $in: taskIds } },
        { deleted_tasks: { $in: taskIds } },
      ],
    },
    fields: {
      title: 1,
      space_id: 1,
      owner_id: 1,
      project_id: 1,
      tasks: 1,
      deleted_tasks: 1,
    },
    transform: transformTasklists(projectIds),
    local,
  })

  return {
    projectIds: [...projectIds.values()],
  }
}

export function transformTasklists (projectIds: Set<string>) {
  return d => {
    joinTaskIdFields(d)
    projectIds.add(d.project_id)
    return d
  }
}

function joinTaskIdFields (d) {
  const tasks = new Set()
  if (d.tasks) d.tasks.forEach(x => tasks.add(x))
  if (d.deleted_tasks) d.deleted_tasks.forEach(x => tasks.add(x))
  d.tasks = [...tasks.values()]
  delete d.deleted_tasks
  return d
}

export async function exportAllTasklists (remote: Db, local: Db, limit: number = 10000) {

  const cursor = remote.collection('tasklists').find()
  .project({ project_id: 1, tasks: 1, deleted_tasks: 1, title: 1 })
  .sort({ _id: -1 })
  .limit(limit)

  await local.collection('tasks_to_tasklists').deleteMany({ })

  const onFlush = async (tasklists: any[]) => {
    console.log(`Flushing ${tasklists.length} tasklists to local db ..`)
    const insert = []
    tasklists.forEach(d => {
      joinTaskIdFields(d)
      d.tasks.forEach(x => {
        insert.push({ _id: x, tasklist_id: d._id.toString(), project_id: d.project_id || null })
      })
    })
    await local.collection('tasks_to_tasklists').insertMany(insert)
  }

  await bufferedStream(cursor, onFlush, 5000)
}
