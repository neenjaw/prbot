import { App, View } from '@slack/bolt'

const homeView = (): View => ({
  type: 'home',
  callback_id: 'homeView',

  /* body of the view */
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Welcome to _PRBot's Home_* :tada:",
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `
Interact with PRBot in two ways:

- Use a command: /prbot <label>
  - returns a list of PRs tagged with the label
- Use an in-channel phase: !prs <label>
  - returns a list of PRs tagged with the label`,
      },
    },
  ],
})

export function registerViewEvents(app: App): void {
  app.event('app_home_opened', async ({ event, client, context }) => {
    try {
      const result = await client.views.publish({
        /* the user that opened your app's app home */
        user_id: event.user,
        view: homeView(),
      })
    } catch (error) {
      console.error(error)
    }
  })
}
