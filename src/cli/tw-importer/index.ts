import {
  getRemoteConnection,
  getLocalConnection,
} from '../../lib/mongo'
import {
  getEsClient,
  search,
} from './es'
import * as Tasks from './tasks'
import * as Credentials from './credentials'
import * as Update from './update'

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection at:', reason)
})

run(require('minimist')(process.argv.slice(2)))
.then(() => console.log(`It’s a Done Deal.`))
.catch(err => console.log('Error:', err))

async function run (opts: any) {
  let remote
  let local
  let es
  try {
    if (opts.debug) console.log(getMemoryUsage())
    
    if (opts.export) {
      if (opts.tasks) {
        remote = await getRemoteConnection()
        local = await getLocalConnection()
        await Tasks.exportTasks(remote.db, local.db, opts)
        return
      }
      else if (opts.metadata) {
        remote = await getRemoteConnection()
        local = await getLocalConnection()
        await Tasks.exportTasksMetadata(remote.db, local.db)
        return
      }
      else if (opts.credentials) {
        remote = await getRemoteConnection()
        local = await getLocalConnection()
        await Credentials.exportCredentials(remote.db, local.db)
        return
      }
      throw new Error('Missing options')
    }

    if (opts.join) {
      local = await getLocalConnection()
      await Tasks.joinTasksMetadata(local.db)
      return
    }
    
    if (opts['join-errors']) {
      remote = await getRemoteConnection()
      await Tasks.confirmJoinErrors(remote.db)
      return
    }

    if (opts.import) {
      if (opts.tasks) {
        es = getEsClient()
        local = await getLocalConnection()
        await Tasks.importTasks(es, local.db, null)
        return
      }
      throw new Error('Missing options')
    }
    
    if (opts.update) {
      if (opts.tasks) {
        remote = await getRemoteConnection()
        local = await getLocalConnection()        
        await Update.updateTasks(remote.db, local.db, opts)
        return
      }
      throw new Error('Missing options')
    }
    
    if (opts.search) {
      if (opts.tasks) {
        const es = getEsClient()
        const timer = Date.now()
        const result = await search(es, 'tw_tasks', 'task', opts)
        console.log(`Found ${result.total} docs in ${Date.now() - timer} ms.`)
        return
      }
      throw new Error('Missing options')
    }

    throw new Error('Missing options')

  } catch (err) {
    if (!err.message.includes('Missing options')) {
      console.log(err)
    } else {
      console.log('Error:', err.message)
    }
    
    console.log(`
    Usage: node dist/report/import-into-es/index.js
    
      --export      Export resources from remote MongoDB server (step 1/3).
        
        [--tasks]   Export tasks.
        [--tasklists]     Export all tasklists.

        [--from]    Export only resources created since this date (YYYY-MM-DD).
        [--limit]   Limit the number of resources to export.

      --metadata    Fetch metadata for previously exported resources (step 2/3).

      --join        Join / attach metadata onto fetched resources (step 3/3).

      --join-error  Check join errors against remote db.
      
      --import      Import resources into ES.
        [--tasks]   Import tasks.     
      
      --update      Pull all resources (tasks, tasklists, projects etc) that have
                    had changes.
        [--tasks]   Update tasks.            
        --from      Consider only changes that happened since this date (YYYY-MM-DD HH:mm).

      --search      Search ES.
        [--tasks]   Use the tasks index.
        [--query]   Search query string. Gets added to body.query.bool.filter.query_string.
        [--debug]   Dump search request and response to stdout.
        [--fields]  Comma-separated string of fields to select (default: return all fields).
        [--aggs]    Include Taskworld specific real-time aggregations.
        [--activeOnly]    Return only active tasks.
        [--overdueOnly]   Return only overdue tasks.
      
      --debug       Dump memory usage.
    `)
  } finally {
    if (opts.debug) console.log(getMemoryUsage())
    if (remote) remote.close()
    if (local) local.close()
  }
}

function getMemoryUsage () {
  const m = process.memoryUsage()
  return `Memory: ${m.heapUsed.toLocaleString()} / ${m.rss.toLocaleString()} bytes`
}
