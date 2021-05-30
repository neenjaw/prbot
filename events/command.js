function registerCommandEvents(app) {
  app.command("/prbot", async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    await say(`${command.text}`);
  });
}

module.exports = { registerCommandEvents };
