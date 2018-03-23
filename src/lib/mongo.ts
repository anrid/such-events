import * as Assert from 'assert'
import { L } from './logger'
import {
  ReadPreference,
  MongoClient,
  ObjectId,
} from 'mongodb'

Assert(process.env.SUCH_EVENTS_PROD_DB, 'Missing env SUCH_EVENTS_PROD_DB')
Assert(process.env.SUCH_EVENTS_LOCAL_DB, 'Missing env SUCH_EVENTS_LOCAL_DB')

let remote
let local

export async function getConnection () {
  if (!remote) {
    remote = await connect(
      process.env.SUCH_EVENTS_PROD_DB,
      getDbName(process.env.SUCH_EVENTS_PROD_DB),
    )
  }
  return remote
}

export async function getLocalConnection () {
  if (!local) {
    local = await connect(
      process.env.SUCH_EVENTS_LOCAL_DB,
      getDbName(process.env.SUCH_EVENTS_LOCAL_DB),
    )
  }
  return local
}

function getDbName (url) {
  const dbName = url.split('/').pop()
  return dbName.replace(/\?.+$/, '')
}

export async function connect (url: string, dbName: string, options: any = { }) {
  L.info(`[MONGO] action=connecting url=${url}`)
  const o = Object.assign({ }, options, {
    readPreference: ReadPreference.SECONDARY_PREFERRED,
    compression: 'zlib',
  })
  const client: any = await MongoClient.connect(url, o)
  const db = client.db(dbName)
  L.info(`[MONGO] action=connected database=${db.databaseName}`)
  return {
    client,
    db,
    newId: id => new ObjectId(id),
    close: () => client.close(),
  }
}
