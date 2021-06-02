if (
  process.env.NODE_ENV !== 'glitch' &&
  process.env.NODE_ENV !== 'production'
) {
  require('dotenv').config({ path: __dirname + '/.env' })
}

import { App, LogLevel } from '@slack/bolt'
import { registerCommandEvents } from './events/command'
import { registerMessageEvents } from './events/message'
import { registerViewEvents } from './events/view'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
})

registerCommandEvents(app)
registerMessageEvents(app)
registerViewEvents(app)

const startServer = async () => {
  await app.start(process.env.PORT ? Number(process.env.PORT) : 3000)
  console.log('⚡️ Bolt app is running!')
}

startServer()
