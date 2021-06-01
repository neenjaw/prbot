import { App } from '@slack/bolt'

export function registerCommandEvents(app: App) {
  app.command('/prbot', async ({ command, ack, say }) => {
    await ack()
    await say(`${command.text}`)
  })
}
