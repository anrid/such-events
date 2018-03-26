import * as Readline from 'readline'
import * as Moment from 'moment'

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

const requests: any = { }

const interval = setInterval(processRequests, 2000)

rl.on('line', line => {
  const d = JSON.parse(line)
  if (d.message === 'event handled' || d.message === 'handle event error') {
    if (d.request) {
      if (!requests[d.request]) requests[d.request] = []
      requests[d.request].push({
        event: d.event,
        took: d.took || 0,
        total: d.total || 0,
        date: d.timestamp,
      })
    }
  }
})

rl.on('close', () => {
  processRequests()
  clearInterval(interval)
})

function processRequests () {
  const current = Moment().subtract(3, 'seconds').format()
  Object.keys(requests).forEach(id => {
    const r = requests[id]
    if (r[0].date < current) {
      let first = true
      requests[id].forEach((e, i) => {
        console.log(
          `${first ? `\n` + pad(e.date) : pad(' ')} ${i + 1}. ${pad('  '.repeat(i) + e.event)} ` +
          `${pad(`took: ${e.took}`, 5)} / ${pad(`${e.total} ms`)}`
        )
        first = false
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
