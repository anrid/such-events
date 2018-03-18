import { Db } from 'mongodb'
import { exportResource } from './db'

export async function exportTags (remote: Db, local: Db, tagIds: string[]) {
  return exportResource({
    remote,
    collection: 'tags',
    ids: tagIds,
    fields: { color: 1, name: 1 },
    local,
  })
}
