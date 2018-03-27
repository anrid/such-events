export function create(message: any, data: any) {
  const err = message.verify(data)
  if (err) throw new Error(`Validation error: ${err}`)
  return message.fromObject(data)
}
