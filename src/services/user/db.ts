import { getLocalConnection } from '../../lib/mongo'
import { L } from '../../lib/logger'

const DB_URL = 'mongodb://localhost/user_service'

export function getConnection () {
  return getLocalConnection(DB_URL)
}

export async function init () { 
  const { db, close } = await getLocalConnection(DB_URL)

  // Drop all collections.
  const collections = await db.listCollections().toArray()
  for (const c of collections) {
    await db.collection(c.name).drop()
  }

  await db.collection('users').createIndex({ email: 1 }, { unique: true })

  L.info({ tag: 'USER', message: 'initialized database ' + DB_URL})
  close()
}

export async function findOne (collection: string, where: any) {
  const { db } = await getConnection()
  return db.collection(collection).findOne(where)
}

export async function insert (collection: string, data: any) {
  const { db } = await getConnection()
  const doc = Object.assign({ }, data)
  if (doc.id) doc._id = doc.id
  if (!doc.created) doc.created = new Date()
  if (!doc.updated) doc.updated = new Date()
  const r = await db.collection(collection).insertOne(doc)
  return r.result.n
}

if (require.main === module) {
  if (process.argv[2] === 'init') {
    init().catch(err => L.error(err))
  }
}
