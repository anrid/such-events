import * as Readline from 'readline'
import * as Moment from 'moment'

const INTERVAL = 4000

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

const requests: any = { }

const interval = setInterval(processRequests, INTERVAL)

const tracked = {
  'request': 'REQ',
  'publish event': 'OUT',
  // 'handle event': 'IN',
  'event handled': 'OK',
  'handle event error': 'ERR',
  'reply': 'REP',
  'request timed out': 'TO',
}

rl.on('line', line => {
  const d = JSON.parse(line)
  const type = tracked[d.message]
  if (type && d.request) {
    if (!requests[d.request]) requests[d.request] = []
    let msg = d.event
    if (type === 'REQ') msg = d.path
    if (type === 'ERR') msg = `"${d.error}"`
    if (type === 'REP') msg = d.type
    requests[d.request].push({
      type,
      msg,
      took: d.took || 0,
      total: d.total || 0,
      date: d.timestamp,
      source: d.source,
    })
  }
})

rl.on('close', () => {
  processRequests()
  clearInterval(interval)
})

function processRequests () {
  const current = Moment().subtract(INTERVAL, 'milliseconds').format()
  Object.keys(requests).forEach(id => {
    const r = requests[id]
    if (r[0].date < current) {
      let first = true
      let source = null
      let indent = -1
      requests[id].forEach((e, i) => {
        if (!source || e.source !== source) indent++
        console.log(
          // Print date, event sequence number and source.
          `${first ? `\n` + pad(e.date, 25) : pad(' ', 25)} ${i + 1}. ${pad(e.source, 20)} | ` +
          // Print type and indented message.
          `${pad(`${'  '.repeat(indent)} ${pad(e.type, 3)} ${e.msg}`, 40)} ` +
          // Print time metrics.
          `${pad(`took: ${e.took}`, 5)} / ${pad(`${e.total} ms`)}`
        )
        first = false
        source = e.source
      })
      delete requests[id]
    }
  })
}

function pad (str: string, width: number = 30) {
  let s = String(str)
  let len = width - s.length
  return s + ' '.repeat(len < 0 ? 0 : len)
}
