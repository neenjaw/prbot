import fs from 'fs'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    console.log(envPath + ' exists')
  } else {
    console.log(envPath + ' does not exists')
  }
  require('dotenv').config({ path: envPath })
}

import { App, ExpressReceiver, LogLevel } from '@slack/bolt'
import { registerCommandEvents } from './events/command'
import { registerMessageEvents } from './events/message'
import { registerViewEvents } from './events/view'

import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions'

if (!process.env.GITHUB_TOKEN) {
  throw new Error('Github token must be supplied in `GITHUB_TOKEN` env var')
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error(
    'Slack bot token must be present in the `SLACK_BOT_TOKEN` env var'
  )
}
if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error(
    'Slack signing secret must be present in the `SLACK_SIGNING_SECRET` env var'
  )
}

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
})

registerCommandEvents(app)
registerMessageEvents(app)
registerViewEvents(app)

export const prBot: HttpFunction = receiver.app
