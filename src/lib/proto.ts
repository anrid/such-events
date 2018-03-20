import * as Path from 'path'
import * as Proto from 'protobufjs'

export function load (file: string) {
  return Proto.loadSync(Path.join(__dirname, '../../proto', file))
}

export function create (root: Proto.Root, type: string, data) {
  const t = root.lookupType(type)
  const m = t.create(data)
  const err = t.verify(m)
  if (err) throw new Error(`Validation error: ${err}`)
  return m
}

export function validate (root: Proto.Root, type: string, data) {
  const t = root.lookupType(type)
  const err = t.verify(data)
  if (err) throw new Error(`Validation error: ${err}`)
}
