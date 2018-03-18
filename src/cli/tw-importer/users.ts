import { Db } from 'mongodb'
import { exportResource } from './db'

export async function exportUsers (remote: Db, local: Db, userIds: string[]) {
  return exportResource({
    remote,
    collection: 'users',
    ids: userIds,
    fields: { email: 1, first_name: 1, last_name: 1 },
    transform: transformUsers(),
    local,
  })
}

export function transformUsers () {
  return d => {
    d.name = `${d.first_name} ${d.last_name}`
    delete d.first_name
    delete d.last_name
    return d
  }
}
