import { Readable, Writable } from 'stream'
import * as Readline from 'readline'
import * as Fs from 'fs'

export function streamObjectsToDisc (read: Readable, write: Writable, transform: (d: any) => any) {
  return new Promise(resolve => {
    let count = 0
    console.log('Streaming objects to disc ..')
    
    read.on('error', err => {
      console.log('Stream objects to disc error:', err)
    })

    read.on('data', doc => {
      ++count
      const d = transform(doc)
      write.write(JSON.stringify(d))
      write.write(`\n`)
      if (count % 5000 === 0) console.log('Streamed %d objects to disc ..', count)
    })

    read.on('end', () => {
      console.log('Streamed %d objects to disc. Done !', count)
      resolve()
    })
  })
}

export function processStream (read: Readable, transform: (d: any, count: number) => void) {
  return new Promise(resolve => {
    let count = 0
    console.log('Processing stream ..')

    read.on('error', err => {
      console.log('Process stream error:', err)
    })

    read.on('data', doc => {
      ++count
      transform(doc, count)
      if (count % 5000 === 0) console.log('Processed %d objects ..', count)
    })

    read.on('end', () => {
      console.log('Processed %d objects. Done !', count)
      resolve()
    })
  })
}

export function bufferedStream (
  read: Readable,
  onFlush: (buffer: any[], index: number) => Promise<void>,
  max: number = 5000,
  transform?: (d: any) => any
) {
  return new Promise(resolve => {
    let buffer = []
    let buffered = 0
    const promises = []

    read.on('error', err => {
      console.log('Buffered stream error:', err)
    })
    
    read.on('data', doc => {
      const d = transform ? transform(doc) : doc
      buffer.push(d)
      buffered++

      if (buffer.length >= max) {
        read.pause()
        const docs = buffer.slice()
        buffer = []
        promises.push(onFlush(docs, buffered).then(() => read.resume()))
      }
    })
    
    read.on('end', () => {
      if (buffer.length) {
        promises.push(onFlush(buffer, buffered))
      }
      Promise.all(promises).then(resolve)
    })
  })
}

export function readFileByLine(file, handler) {
  return new Promise(resolve => {
    console.log('Reading file by line:', file)
    const rl = Readline.createInterface({ input: Fs.createReadStream(file) })
    rl.on('line', line => handler(line, rl))
    rl.on('close', resolve)
  })
}
