import { Db } from 'mongodb'
import { exportResource } from './db'

export async function exportWorkspaces (remote: Db, local: Db, workspaceIds: string[]) {
  const userIds = new Set()

  await exportResource({
    remote,
    collection: 'workspaces',
    ids: workspaceIds,
    fields: {
      display_name: 1,
      owner_id: 1,
      admins: 1,
      members: 1,
      created: 1,
      updated: 1,
    },
    transform: transformWorkspaces(userIds),
    local,
  })
  
  return {
    userIds: [...userIds.values()]
  }
}

export function transformWorkspaces (userIds: Set<string>) {
  return d => {
    d.member_count = d.members.length
    
    userIds.add(d.owner_id)
    d.admins.forEach(x => userIds.add(x))
    d.members.forEach(x => userIds.add(x))

    return d
  }
}
