function registerMessageEvents(app) {
  // This will match any message that contains 👋
  app.event("message", async ({ message }) => {
    console.log(message);
    // await say(`Hello, <@${message.user}>`);
  });
}

module.exports = { registerMessageEvents }