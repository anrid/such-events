import * as Assert from 'assert'
import { L } from './logger'
import {
  Db,
  ReadPreference,
  MongoClient,
  ObjectId,
  MongoClientOptions,
} from 'mongodb'

Assert(process.env.SUCH_EVENTS_PROD_DB, 'Missing env SUCH_EVENTS_PROD_DB')
Assert(process.env.SUCH_EVENTS_LOCAL_DB, 'Missing env SUCH_EVENTS_LOCAL_DB')

let remote: ConnectionResponse
let local: ConnectionResponse

export async function getRemoteConnection (url?: string) {
  if (!remote) {
    remote = await connect(url || process.env.SUCH_EVENTS_PROD_DB, null)
  }
  return remote
}

export async function getLocalConnection (url?: string) {
  if (!local) {
    local = await connect(url || process.env.SUCH_EVENTS_LOCAL_DB, null)
  }
  return local
}

function getDbName (url) {
  const dbName = url.split('/').pop()
  return dbName.replace(/\?.+$/, '')
}

export async function connect (url: string, _dbName: string | null, options: any = { }): Promise<ConnectionResponse> {
  const dbName = _dbName || getDbName(url)
  const o: MongoClientOptions = Object.assign({ }, options, {
    readPreference: ReadPreference.SECONDARY_PREFERRED,
    compression: 'zlib',
  })

  L.info({ tag: 'MONGO', message: 'connecting', url, options: o })
  const client = await MongoClient.connect(url, o)
  
  const db = client.db(dbName)
  L.info({ tag: 'MONGO', message: 'connected', database: db.databaseName, options: o })

  return {
    client,
    db,
    newId: id => new ObjectId(id),
    close: () => client.close(),
  }
}

interface ConnectionResponse {
  client: MongoClient
  db:     Db
  newId:  (id: string) => ObjectId
  close:  () => void
}
