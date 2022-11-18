// Require the Bolt package (github.com/slackapi/bolt)
const SlackBolt = require("@slack/bolt");
const helpMe = require("./helpme.js");
const postQuery = require("./postQuery.js");
const { init, getDb } = require("./connect");
const api = require("./api");

const { App, subtype } = SlackBolt;
const existingMessageQuery = require("./existingMessageQuery");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// app.event('message', async ({ event, client, context }) => { console.log(JSON.stringify(event))})
app.event("message", async ({ event, client, context }) => {
  // console.log("im", JSON.stringify(event, null, 3));
  if (!!event["thread_ts"]) {
    // Check if the parent message already exist in mongodb
    console.log("Seems  like this question is already posted by someone.");
    let toCheckThreadId = event["thread_ts"];
    const db = await getDb();
    db.collection("queries")
      .find({ ts: toCheckThreadId })
      .toArray(async function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          console.log("This was previously Asked question", result[0]);
          try {
            const response = await api.request({
              method: "post",
              url: "/posts.json",
              data: {
                topic_id: result[0].topic_id,
                raw: event.text.padEnd(25, " ")
              }
            });
            console.log(response);
          } catch (err) {
            console.log(err.response.data);
          }

          // Post the reply to discource
        } else {
          console.log("Replying to ordinary messages");
        }
      });
  } else if (
    (event.text && event.text.toLowerCase().includes("?")) ||
    event.text.toLowerCase().includes("how") ||
    event.text.toLowerCase().includes("not able")
  ) {
    const ctaValue = JSON.stringify({
      query: event.text,
      id: event.ts
    });
    try {
      await client.chat.postEphemeral({
        channel: event.channel,
        user: event.user,
        text:
          "hey this seems like a question, you can use *help-me* command to ask question",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "hey this seems like a question, you can use *help-me* command to ask question or click on search"
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Search your query",
                  emoji: true
                },
                value: ctaValue,
                action_id: "existing_message_query"
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error(error);
    }
  }
});

app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey abhishek <@${message.user}> from kes!`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me"
          },
          action_id: "post_query",
          value: "click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action("existing_message_query", existingMessageQuery);

app.action("post_query", postQuery);

app.command("/help-me", helpMe);

app.message(subtype("message_replied"), ({ event, logger }) => {
  logger.info(
    `The user ${event.message.user} changed their message from ${event.previous_message.text} to ${event.message.text}`
  );
});

app.message("Need Help", async ({ client, payload, context }) => {
  try {
    let result = await app.client.search.messages({
      token: context.user_token,
      query: "Mongo"
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// All the room in the world for your code

(async () => {
  // Start your app
  try {
    await init();
    await app.start(process.env.PORT || 3000);
  } catch (error) {
    console.error(JSON.stringify(error));
  }

  console.log("⚡️ Bolt app is running!");
})();
