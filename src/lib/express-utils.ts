import * as Joi from 'joi'
import * as Boom from 'boom'
import { L } from './logger'

export function endpoint (asyncFunc: Function, opts: any = { }) {
  return (req, res, next) => {
    if (opts.credentials !== false) {
      // Require credentials by default !
      if (!req.credentials || !req.credentials.id || !req.credentials.email) {
        const route = getRouteString(req)
        throw new Error('Missing credentials for route ' + route)
      }
    }
    return asyncFunc(req, res, next).catch(next)
  }
}

function getRouteString (req) {
  if (req.route) {
    const keys = Object.keys(req.route.methods)
    if (keys.length) {
      return `${keys[0].toUpperCase()} ${req.route.path}`
    }
  }
  return '[unknown route]'
}

export function validate (data: any, schema: Joi.AnySchema, request) {
  const r = Joi.validate(data, schema, { stripUnknown: true })
  if (r.error) {
    const details = r.error.details.map(x => x.message)
    const lines = searchStack('/api/server/', r.error)
    L.warn('Validation error: %s', details.join(', '))
    L.warn('Route: %s', getRouteString(request))
    L.warn('Where: %s', lines.join(`\n`))
    throw Boom.badRequest(
      'Validation error: ' + details.join(', '),
      { details: r.error.details },
    )
  }
  return r.value
}

export function searchStack (pattern: string, err: Error) {
  return err.stack.split(/[\r\n]+/).filter(x => (
    !x.includes(__filename) && x.includes(pattern)
  ))
}

export function defaultExpressErrorHandler (err, _req, res, _next) {
  if (err) {
    if (Boom.isBoom(err)) {
      // Don't output validation errors twice.
      if (!err.output.payload.message.includes('Validation error')) {
        L.error(err)
      }
      res.status(err.output.payload.statusCode).send(err.output.payload)
    } else {
      L.error(err)
      res.status(500).send({ error: err.message })
    }
  }
}
