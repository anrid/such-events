import * as Nats from './nats-streaming'

export async function runService (_opts: ServiceOptions) {
  const args: CommandLineOptions = require('minimist')(process.argv.slice(2))
  const opts: ServiceOptions = Object.assign(_opts, args)

  const stan = await Nats.getConnection(null)

  const sub = Nats.subscribeToEvents(stan, {
    source: opts.id,
    queueGroup: opts.group,
    eventHandlers: opts.eventHandlers,
    durable: opts.id
  })

  return {
    sub,
    stan,
    close: () => stan.close(),
  }
}

interface CommandLineOptions {
  id:    string     // Service id.
}

interface ServiceOptions {
  id:    string     // Service id.
  eventHandlers: Nats.EventHandlersMap // Event handlers.
  group?: string    // Service group name.
                    // Allows for round-robin distribution of events to
                    // a group of workers.
}
