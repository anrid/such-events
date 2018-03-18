import { Client } from 'elasticsearch'
import * as Aggs from './aggs'

export function getEsClient () {
  return new Client({
    host: 'localhost:9200',
    log: 'info',
  })
}

export async function search (client: Client, index: string, type: string, opts: any) {
  const args: any = {
    index,
    type,
    body: { },
    size: opts.size || 3,
  }

  const query: any = { bool: { } }

  // Query string as filter.
  if (opts.query) {
    query.bool.filter = {
      query_string: {
        default_operator: 'AND',
        query: opts.query,
      },
    }
  }

  // Apply additional filters.
  if (opts.activeOnly) Object.assign(query.bool, Aggs.activeOnly)
  if (opts.overdueOnly) Object.assign(query.bool, Aggs.overdueOnly)

  args.body.query = query

  // Filter _source field.
  if (opts.fields) {
    args._source = opts.fields.split(/[ ,]+/)
  }

  // Sort result.
  if (opts.sort) {
    args.sort = opts.sort
  }

  // Include pre-canned aggregations.
  if (opts.aggs) {
    args.body.aggs = {
      active: Aggs.active,
      completed: Aggs.completed,
      completed_late: Aggs.completedLate,
      total_unique_workspaces: Aggs.totalUniqueWorkspaces,
    }
  }

  // Allow highlighting of provided fields.
  if (opts.highlight) {
    const fieldsMap = opts.highlight.split(/\s*,\s*/).reduce((acc, x) => {
      acc[x] = { }
      return acc
    }, { })
    args.body.highlight = {
      fields: fieldsMap,
    }
  }

  if (opts.debug) console.log('List request:', JSON.stringify(args, null, 2))
  
  // Run search !
  const esResponse = await client.search(args)
  // if (opts.debug) console.log('Elasticsearch response:', JSON.stringify(esResponse, null, 2))

  const result = toResult(esResponse)
  
  if (opts.debug) console.log('Result:', JSON.stringify(result, null, 2))
  if (opts.pretty) prettyPrintResult(index, result)

  return result
}

function prettyPrintResult (index: string, r: any) {
  console.log(`Fetched ${r.hits.length} / ${r.total} from index ${index} in ${r.took} ms.`)
  console.log(JSON.stringify(r.hits, null, 2))
  if (r.aggs) {
    const buckets = r.aggs.active.stats.buckets
    console.log(`
  Report:
    - Active         : ${buckets.active.doc_count}
    - Upcoming       : ${buckets.upcoming.doc_count}
    - Overdue        : ${buckets.overdue.doc_count}
    - Completed      : ${r.aggs.completed.doc_count}
    - Completed Late : ${r.aggs.completed_late.doc_count}
    - Workspaces     : ${r.aggs.total_unique_workspaces.value}
    `)
  }
}

export async function createIndex (client: Client, index: string, body: any) {
  if (await client.indices.exists({ index })) {
    await client.indices.delete({ index })
    console.log('Deleted old es index:', index)
  }

  const r1 = await client.indices.create({
    index,
    body,
    waitForActiveShards: '1',
  })
  console.log('Created index:', r1)

  const r2 = await client.indices.getMapping({ index })
  console.log('Index mappings:', r2)
}

export function bulkImportIntoEs (
  client: Client,
  index: string,
  type: string,
  docs: any[],
) {
  // console.log(`Bulk indexing ${docs.length} docs into es ..`)
  const commands = toBulkIndexCommands(index, type, docs)
  return client.bulk({ body: commands })
}

function toBulkIndexCommands (index, type, docs) {
  return docs.reduce((acc, t) => {
    const id = t._id
    delete t._id
    acc.push({ index: { _index: index, _type: type, _id: id } })
    acc.push(t)
    return acc
  }, [])
}

function toResult (res: any) {
  const r: any = {
    took: res.took,
    total: res.hits.total,
    hits: res.hits.hits.map(x => {
      x._source._id = x._id
      // Allow highlights to overwrite existing fields.
      if (x.highlight) {
        Object.keys(x.highlight).forEach(y => {
          x._source[y] = x.highlight[y]
        })
      }
      return x._source
    }),
  }
  if (res.aggregations) {
    r.aggs = res.aggregations
  }
  return r
}
