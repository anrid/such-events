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

  if (d.message && d.message.includes('=')) {
    const pairs: any = { }    
    d.message.split(/\s+/).forEach(pair => {
      const [key, value] = pair.split('=')
      pairs[key] = value
    })

    // Extract requests.
    if (pairs.request && pairs.action === 'event') {
      if (!requests[pairs.request]) requests[pairs.request] = []
      requests[pairs.request].push({
        event: pairs.event,
        took: parseInt(pairs.took, 10) / 1000,
        total: pairs.total,
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
          `${pad(`took: ${e.took} sec`, 15)} / ${pad(`${e.total} sec`)}`
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
