import * as Nats from './nats-streaming'
import * as Stan from 'node-nats-streaming'

let hasRegisteredExitHandler = false
const connections = []

export async function runService (_opts: RunServiceOptions): Promise<RunServiceResponse> {
  const args: CommandLineOptions = require('minimist')(process.argv.slice(2))
  const opts: RunServiceOptions = Object.assign(_opts, args)

  const stan = await Nats.getConnection(opts.id)
  connections.push(stan)

  const sub = Nats.subscribeToEvents(stan, {
    source: opts.id,
    queueGroup: opts.group,
    eventHandlers: opts.eventHandlers,
    durable: opts.id
  })

  return {
    sub,
    stan,
    isReady: sub['isReady'],
    close: () => stan.close(),
  }
}

export function registerExitHandler () {
  // Always try to close the NATS connection !
  if (hasRegisteredExitHandler) return

  process.on('exit', exitHandler)
  // Catches ctrl+c event
  process.on('SIGINT', () => process.exit())
  // Catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', () => process.exit())
  process.on('SIGUSR2', () => process.exit())
  // Catches uncaught exceptions
  process.on('uncaughtException', () => process.exit())

  // Make sure we do this only once.
  hasRegisteredExitHandler = true
}

function exitHandler () {
  console.log(`Closing ${connections.length} NATS connections ..`)
  connections.forEach(x => x.close())
  setTimeout(() => process.exit(), 3000)
}

interface RunServiceResponse {
  sub:     Stan.Subscription
  stan:    Stan.Stan            // NATS streaming server connection.
  isReady: Promise<void>        // Resolves when the returned subscription goes ready.
  close:   Function             // Closes the underlying connection.
}

interface CommandLineOptions {
  id:     string    // Service id.
  name:   string    // Service subscription name. This creates a durable
                    // subscription that will be automatically resumed,
                    // assuming the client reconnects using the same id
                    // and name pair.
  group?: string    // Service group name. This allows for distribution of
                    // events to a group of workers where each worker receives
                    // and handles one event, as opposed to all subscribers
                    // receiving the same event.
}

interface RunServiceOptions {
  id:     string    // Service id.
  name:   string    // Service subscription name (see above).
  group?: string    // Service group name (see above).

  // A map of event handlers.
  // Handlers are simple functions returning a promise (e.g. an async function).
  // Handlers are responsible for checking the integrity of both inbound and outbound
  // events using static, pre-compiled protobuf definitions.
  eventHandlers: Nats.EventHandlersMap
}
