import { Db } from 'mongodb'
import { exportResource } from './db'

export async function exportCredentials (remote: Db, local: Db) {
  return exportResource({
    remote,
    collection: 'users',
    predicate: { email: /@taskworld.com$/ },
    fields: {
      _id: 1, 
      email: 1,
      time_zone: 1,
      language: 1,
      salt: 1,
      hashed_password: 1,
      access_tokens: 1,
    },
    sort: { _id: -1 },
    local,
    localCollection: 'credentials',
    onExportComplete,
  })
}

async function onExportComplete (_remote: Db, local: Db) {
  const r1 = await local.collection('credentials').createIndex({ 'access_tokens.access_token': 1 })
  console.log('Created index on credentials:', r1)

  const r2 = await local.collection('credentials').createIndex({ 'email': 1 })
  console.log('Created index on credentials:', r2)
}
