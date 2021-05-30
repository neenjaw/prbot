function registerViewEvents(app) {
  app.event("app_home_opened", async ({ event, client, context }) => {
    try {
      /* view.publish is the method that your app uses to push a view to the Home tab */
      const result = await client.views.publish({
        /* the user that opened your app's app home */
        user_id: event.user,

        /* the view object that appears in the app home*/
        view: {
          type: "home",
          callback_id: "home_view",

          /* body of the view */
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Welcome to _PRBot's Home_* :tada:"
              }
            },
            {
              type: "divider"
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Interact with PRBot in two ways:
                
1) Use a command: /prbot <label>
   - returns a list of PRs tagged with the label
2) Use an in-channel phase: !prs <label>
   - returns a list of PRs tagged with the label`
              }
            }
          ]
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
}

module.exports = { registerViewEvents };
