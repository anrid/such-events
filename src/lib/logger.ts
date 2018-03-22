import * as Winston from 'winston'

export const L = new Winston.Logger({
  transports: [
    new Winston.transports.File({
      level:            'info',
      filename:         '/tmp/such-events.log',
      handleExceptions: true,
      json:             true,
      maxsize:          5242880, // 5MB
      maxFiles:         5,
      colorize:         false,
      humanReadableUnhandledException: true,
    }),
    new Winston.transports.Console({
      level:            'debug',
      handleExceptions: true,
      json:             false,
      colorize:         true,
      humanReadableUnhandledException: true,
    })
  ],
  exitOnError: false,
})
