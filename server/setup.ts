import log from 'loglevel'

if (process.env.NODE_LOG_LEVEL) {
  log.setDefaultLevel(process.env.NODE_LOG_LEVEL as log.LogLevelDesc)
} else {
  log.setDefaultLevel('info')
}
