export const EVENTS: RequestToEventMap = {
  '/api/v1/signup': {
    'POST': {
      event: 'v1.signup.create',
      credentials: false,
    }
  },
  '/api/v1/login': {
    'POST': {
      event: 'v1.user.login',
      credentials: false,
    }
  },
  '/api/v1/echo': {
    'POST': {
      event: 'v1.echo.create',
      credentials: false,
    }
  },
  '/api/v1/echo-secret': {
    'POST': {
      event: 'v1.echo-secret.create',
    }
  },
  '/api/v1/slow': {
    'POST': {
      event: 'v1.slow',
      credentials: false,
    }
  },
}

interface RequestToEventMap {
  [path: string]: {
    [method: string]: {
      event:        string,   // Name of the event, e.g. v1.signup.create or v2.login.create.
      credentials?: boolean,  // Requires credentials or not (default: true).
    }
  }
}
