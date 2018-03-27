import { getLocalConnection } from '../../lib/mongo'
import { L } from '../../lib/logger'
import { createSalt, createPassword } from './util'

const DB_URL = 'mongodb://localhost/' + (process.env.NODE_ENV === 'test' ? 'user_service_test' : 'user_service')

export async function init (closeConnection: boolean = false) { 
  const { db } = await getConnection()
  // Drop all collections.
  const collections = await db.listCollections().toArray()
  for (const c of collections) {
    await db.collection(c.name).drop()
  }

  // Create indexes.
  await db.collection('users').createIndex({ email: 1 }, { unique: true })

  // Create test data.
  await createTestData()

  L.info({ tag: 'USER', message: 'initialized database ' + DB_URL})
  if (closeConnection) close()
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

export async function createTestData () {
  const salt = createSalt()
  const password = createPassword('123456', salt)
  
  const user1 = {
    id: 'joe-test',
    name: 'Joe Schmoe',
    email: 'joe@example.com',
    salt,
    password,
  }

  await insert('users', user1)
}

export function getConnection () {
  return getLocalConnection(DB_URL)
}

export function close () {
  return getConnection().then(({ client }) => client.close())
}

if (require.main === module) {
  if (process.argv[2] === 'init') {
    init(true).catch(err => L.error(err))
  }
}

