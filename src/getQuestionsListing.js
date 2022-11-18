const axios = require("axios");
const { COOKIE } = require("./constants.js");

const stopwords = [
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
  ".",
  "?"
];

function remove_stopwords(str) {
  let res = [];
  let words = str.toLowerCase().split(" ");
  for (let i = 0; i < words.length; i++) {
    let word_clean = words[i].split(".").join("");
    if (!stopwords.includes(word_clean)) {
      res.push(word_clean);
    }
  }
  return res.join(" ");
}

async function getBlocksForListing(query, ctaValue) {
  const toSearch = remove_stopwords(query);
  console.log({ toSearch });
  const resp = await axios.get(
    `https://discuss.sharechat.com/search.json?q=${toSearch}`,
    { headers: { cookie: COOKIE } }
  );
  const data = await resp.data;
  const sections = data?.topics?.flatMap((topic) => {
    const post = data.posts.filter((el) => el.topic_id === topic.id);

    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<https://discuss.sharechat.com/t/${topic.slug}/${topic.id} | ${topic.title}>*`
        }
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Author: ${post?.[0]?.name}    |       Created At: ${new Date(
            post?.[0]?.created_at
          ).toLocaleString()}`
        }
      }
    ];
  });
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Question* :" + query
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Here are few resources related to your query"
      }
    },
    {
      type: "divider"
    },
    ...sections,

    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url:
            "https://ik.imagekit.io/vzvgwjml4/confused.png?ik-sdk-version=javascript-1.4.3&updatedAt=1668666601146",
          alt_text: "Not Helpfull ?"
        },
        {
          type: "mrkdwn",
          text: "If not helpful you can post your query on discussion forum."
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "continue posting question"
          },
          style: "primary",
          action_id: "post_query",
          value: ctaValue
        }
      ]
    }
  ];
  return blocks;
}

module.exports = getBlocksForListing;
