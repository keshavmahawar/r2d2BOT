const getBlocksForListing = require("./getQuestionsListing");

const helpMe = async ({ ack, payload, context, client }) => {
  await ack();

  // Find query and list the available solutions.
  const query = payload["text"];
  const ctaValue = JSON.stringify({
    query
  });
  if (!query) return;
  try {
    const blocks = await getBlocksForListing(query, ctaValue);
    await client.chat.postEphemeral({
      token: context.botToken,
      // Channel to send message to
      user: payload.user_id,
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks,
      // Text in the notification
      text: "Possible solution for your search"
    });
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      token: context.botToken,
      // Channel to send message to
      user: payload.user_id,
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "Can't find the related query in the database. Would you like to post your question ?"
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              action_id: "post_query",
              text: {
                type: "plain_text",
                emoji: true,
                text: "continue posting question"
              },
              style: "primary",
              value: ctaValue
            }
          ]
        }
      ],
      // Text in the notification
      text: "Message from Test App"
    });
  }
};

module.exports = helpMe;
