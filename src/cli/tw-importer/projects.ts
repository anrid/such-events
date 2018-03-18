import { Db } from 'mongodb'
import { exportResource } from './db'

export async function exportProjects (remote: Db, local: Db, projectIds: string[]) {
  return exportResource({
    remote,
    collection: 'projects',
    fields: {
      title: 1,
      description: 1,
      space_id: 1,
      owner_id: 1,
      members: 1,
      is_deleted: 1,
      is_archived: 1,
      is_private: 1, 
      is_personal: 1,
      permissions: 1,
      status: 1,
      completed_date: 1,
      due_date: 1,
      start_date: 1,
      created: 1,
      updated: 1,
    },
    ids: projectIds,
    transform: transformProjects(),
    local,
  })
}

export function transformProjects () {
  return d => {
    d.admins = d.members.filter(x => x.is_admin === true).map(x => x._id)
    d.members = d.members.filter(x => x.is_admin === false).map(x => x._id)
    return d
  }
}
