const getBlocksForListing = require("./getQuestionsListing");

const existingMessageQuery = async ({
  ack,
  say,
  body,
  context,
  respond,
  client
}) => {
  console.log("eisiting_message_query");
  try {
    await respond({
      response_type: "ephemeral",
      text: "",
      replace_original: true,
      delete_original: true
    });
    const existingvalue = body.actions[0].value;
    const existingvalueParased = JSON.parse(existingvalue);
    console.log(body.actions[0].value, existingvalueParased);
    const query = existingvalueParased.query;
    const blocks = await getBlocksForListing(query, existingvalue);

    await client.chat.postEphemeral({
      token: context.botToken,
      user: body.user.id,
      channel: body.channel.id,
      blocks,
      // Text in the notification
      text: "Possible solutions listing for your search"
    });
    ack();
  } catch (error) {
    console.error(error);
  }
};

module.exports = existingMessageQuery;
