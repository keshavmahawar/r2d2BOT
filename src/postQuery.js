const { getDb } = require("./connect");
const api = require("./api");

const postQuery = async ({
  ack,
  say,
  body,
  context,
  respond,
  payload,
  client
}) => {
  const parsedValue = JSON.parse(body.actions[0].value);
  const query = parsedValue.query;
  const id = parsedValue.id;

  try {
    await respond({
      response_type: "ephemeral",
      text: "",
      replace_original: true,
      delete_original: true
    });

    // Update the message
    //     const result = await app.client.chat.delete({
    //       token: context.botToken,
    //       // ts of message to update
    //       ts: body.container.message_ts,
    //       // Channel of message
    //       channel: body.channel.id,

    //     });
    // return;
    // posting messages to mongodb if user not satisfied with suggested post
    // console.log(payload);
    /*await client.chat.postEphemeral({
      token: context.botToken,
      // Channel to send message to
      user: body.user.id,
      channel: body.channel.id,
      title: {
        type: "plain_text",
        text: "Post Your Query",
        emoji: true
      },
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true
      },
      type: "modal",
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true
      },
      blocks: [
        {
          type: "divider"
        },
        {
          type: "input",
          element: {
            type: "plain_text_input",
            action_id: "plain_text_input-action"
          },
          label: {
            type: "plain_text",
            text: "Title",
            emoji: true
          }
        },
        {
          type: "input",
          element: {
            type: "plain_text_input",
            multiline: true,
            action_id: "plain_text_input-action"
          },
          label: {
            type: "plain_text",
            text: "Description",
            emoji: true
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Post Your Query"
              },
              style: "primary",
              value: "post_query"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Deny"
              },
              style: "danger",
              value: "click_me_123"
            }
          ]
        }
      ],
      // Text in the notification
      text: "Message from Test App"
    });*/
    console.log(query);

    const response = await api.request({
      method: "post",
      url: "/posts.json",
      data: {
        title: query.padEnd(25, " "),
        raw: " description of the question can be added here so that user can respond better".padEnd(
          25,
          "t"
        ),
        category: 7
      }
    });
    const data = response.data;
    console.log(data);
    const url = api.defaults.baseURL + "/t/" + data.topic_id;
    let messageToPost;

    if (id) {
      messageToPost = { ts: id };
    } else {
      messageToPost = await say(query);

      console.log(messageToPost);
    }
    await say({
      thread_ts: messageToPost.ts,
      text:
        "thread has been disccuss.sharechat.com you can follow on URL:" + url
    });
    messageToPost.topic_id = data.topic_id;
    var myobj = [messageToPost];

    const db = await getDb();

    db.collection("queries").insertMany(myobj, function (err, res) {
      if (err) throw err;
      console.log("Queries Posted : " + res.insertedCount);
    });
  } catch (error) {
    console.error(error);
    console.log("err", error.response.data);
    console.log("err", error.data);
  }

  ack();
};

module.exports = postQuery;
