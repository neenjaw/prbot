const { fetchPRs } = require('../lib/gh')
const { formatPrsForChannel } = require('../lib/report')

const PR_COMMAND = '!prs'

function registerMessageEvents(app) {
  app.message(
    new RegExp(`^${PR_COMMAND}`, 'i'),
    async ({ message, say, client }) => {
      const channel = message.channel
      const commandParams = message.text.slice(PR_COMMAND.length).trim()

      if (commandParams === '') {
        return
      }

      const labels = commandParams.split(/\s+/)
      const prs = await fetchPRs({ labels })

      if (prs.length === 0) {
        return
      }

      await client.chat.postMessage({
        channel,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: formatPrsForChannel(prs),
            },
          },
        ],
        text: `Open PRs with labels ${commandParams} fetched`,
        unfurl_links: false,
        unfurl_media: false,
      })

      // delete old fetch'd pr messages

      const { ok: authOk, bot_id } = await client.auth.test()

      if (!authOk) {
        console.error('Unable to retrieve auth information')
        return
      }

      const { ok: historyOk, messages } = await client.conversations.history({
        channel,
      })

      if (!historyOk) {
        console.error('Unable to retrieve conversation history for channel')
        return
      }

      const botMessages = messages
        .filter((message) => message?.bot_id === bot_id)
        .slice(1) // don't delete the most recent one!

      for (const message of botMessages) {
        await client.chat.delete({
          channel,
          ts: message.ts,
        })
      }
    }
  )
}

module.exports = { registerMessageEvents }
