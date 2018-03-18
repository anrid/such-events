import { Db, Cursor, ObjectId, AggregationCursor } from 'mongodb'
import * as Fs from 'fs'
import {
  bufferedStream,
  streamObjectsToDisc,
} from './stream'

export async function processInChunks (
  data: any[],
  chunkSize: number,
  func: (chunk: any[], index: number, total: number) => Promise<any>
) {
  let i = 0
  while (i < data.length) {
    const chunk = data.slice(i, i + chunkSize)
    await func(chunk, i, data.length)
    i += chunkSize
  }
}

export function streamToLocalDb (
  cursor: Cursor | AggregationCursor,
  local: Db,
  collection: string,
  transform: (d: any) => any,
  replace: boolean,
  beforeFlush?: (buffer: any[], buffered) => Promise<void>,
) {
  // Function to execute each time we flush the buffer.
  const onFlush = async (buffer: any[], buffered: number) => {
    console.log('Streamed %d docs into local collection %s ..', buffered, collection)
    if (beforeFlush) await beforeFlush(buffer, buffered)
    if (replace) {
      const ids = buffer.map(x => x._id)
      const deleted = await local.collection(collection).deleteMany({ _id: { $in: ids } })
      console.log(`Deleted ${deleted.result.n} docs.`)
    }
    await local.collection(collection).insertMany(buffer)
  }

  return bufferedStream(cursor, onFlush, 5000, transform)
}

export function getByIds (db: Db, collection: string, ids: string[], project: any | null) {
  return db.collection(collection)
  .find(byIdsPredicate(ids))
  .project(project)
  .toArray()
}

export function byIdsPredicate (ids) {
  return { _id: { $in: toObjectIds(ids) } }
}

export function toObjectIds (ids) {
  return ids.filter(x => x && x.length === 24).map(x => new ObjectId(x))
}

export async function exportResource (a: ExportResourceArgs) {
  console.log(`Exporting from remote collection ${a.collection} ..`)
  
  let predicate
  if (a.predicate) {
    // Use given predicate.
    predicate = a.predicate
  } else if (a.ids) {
    // Fetch resources by ids.
    predicate = byIdsPredicate(a.ids)
  }
  
  const cursor = a.remote.collection(a.collection).find(predicate)
  if (a.fields) cursor.project(a.fields)
  if (a.sort) cursor.sort(a.sort)
  if (a.limit) cursor.limit(a.limit)

  const transform = d => a.transform ? a.transform(d) : d

  if (a.local) {
    // Stream to local db replacing existing docs.
    await streamToLocalDb(cursor, a.local, a.localCollection || a.collection, transform, true)
    if (a.onExportComplete) {
      await a.onExportComplete(a.remote, a.local)
    }
  } else {
    // Stream to disc.
    const outfile = `/tmp/${a.collection}-json.txt`
    const write = Fs.createWriteStream(outfile, 'utf-8')
    console.log('Streaming to ' + outfile)
    await streamObjectsToDisc(cursor, write, transform)
  }
}

interface ExportResourceArgs {
  remote:         Db,         // Remote MongoDB connection instance.
  local?:         Db,         // Local MongoDB connection instance, if we wish to stream to local db.
  collection:     string,     // MongoDB collection name.
  fields?:        any,        // Fields to select / project (default: all fields).
  transform?:     Function,   // Transform function applied to each doc.
  ids?:           string[],   // MongoDb primary keys (as strings or ObjectId instances).
  predicate?:     any,        // Predicate (where-clause).
  sort?:          any,        // Sort the remote result set.
  limit?:         number,     // Limit the size of the remote result set.
  localCollection?: string,    // Local MongoDB collection name (default: same as remote).

  // Function to run after export has successfully completed.
  onExportComplete?: (remote: Db, local: Db) => Promise<void>
}
