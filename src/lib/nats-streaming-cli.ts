import {
  getConnection,
  subscribeToEvents,
  publishEvent,
  EVENT_SOURCE_SUBJECT
} from './nats-streaming'
import * as Crypto from 'crypto'

cli(require('minimist')(process.argv.slice(2)))
.catch(err => console.error(err))

async function cli (opts: any) {
  if (opts.sub) {
    // Create a durable event source subscription.
    const clientId = opts.id
    const conn = await getConnection(clientId)
    subscribeToEvents(conn, {
      subject: EVENT_SOURCE_SUBJECT,
      source: 'cli-sub',
      queueGroup: opts.group ? opts.group : null,
      eventHandlers: {
        'cli-test': async e => {
          console.log(`Received message ${e.data.message}`)
          if (opts.cpu) {
            // Simulate a CPU bound delay.
            Crypto.pbkdf2Sync('password', Crypto.randomBytes(16), parseInt(opts.cpu, 10), 512, 'sha512')
          }
          if (opts.network) {
            // Simulate a network delay.
            await new Promise(resolve => setTimeout(resolve, parseInt(opts.network, 10)))
          }
        }
      },
      durable: opts.name,
      fromTimeAgo: /\d+ \w+/.test(opts.from) ? opts.from : null,
      fromBeginning: opts.from === 'start',
      max: opts.max ? parseInt(opts.max, 10) : 0,
    })
  } else if (opts.pub) {
    // Create a simple event source publisher that
    // publishes a message every 500ms.
    const clientId = opts.id
    const conn = await getConnection(clientId)
    let i = 0
    setInterval(() => {
      publishEvent(conn, {
        source: 'cli-pub',
        event: 'cli-test',
        data: { message: `Hello #${++i} !` },
        credentials: null,
      })
    }, opts.rate ? parseInt(opts.rate, 10) : 500)
  } else {
    console.log(`
    Usage: node dist/lib/nats-streaming.js
      --sub             Subscribe to "cli-test" event.
      --pub             Publish "cli-test" events in a loop.
      
      [--rate]          Rate at which the publisher publishes messages.

      [--id]            Client ID.
      [--name]          Create a durable subscription with the given name.
      [--group]         Client group.

      [--cpu <value>]   Simulate a CPU bound delay. Will encrypt a password
                        over <value> iterations.
      [--network <value>]   Simulate a network delay. A simple timeout of <value> ms.

      [--from <value>]  Read messages from:
                        value = "start": Read from the beginning of queue.
                        value = "<number> <unit: days|hours|minutes>":
                        Read messages from "X units" ago,
                        e.g. "30 days", "2 hours", "10 minutes".

      [--max]           Max number of unacked message in-flight for this subscription.
    `)
  }
}
