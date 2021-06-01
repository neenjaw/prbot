if (
  process.env.NODE_ENV !== 'glitch' &&
  process.env.NODE_ENV !== 'production'
) {
  require('dotenv').config()
}

const { App, LogLevel } = require('@slack/bolt')
const { registerCommandEvents } = require('./events/command')
const { registerMessageEvents } = require('./events/message')
const { registerViewEvents } = require('./events/view')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
})

registerCommandEvents(app)
registerMessageEvents(app)
registerViewEvents(app)

const startServer = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
}

startServer()
