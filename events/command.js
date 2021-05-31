function registerCommandEvents(app) {
  app.command("/prbot", async ({ command, ack, say }) => {
    await ack();
    await say(`${command.text}`);
  });
}

module.exports = { registerCommandEvents };
