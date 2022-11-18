// Require the Bolt package (github.com/slackapi/bolt)

const { MongoClient } = require("mongodb");

const DBURI =
  "mongodb+srv://schackfest:schackfest@cluster0.b1pteqm.mongodb.net/?retryWrites=true&w=majority";

let db = null;
const init = () => {
  MongoClient.connect(DBURI, function (err, dbInstance) {
    if (err) throw err;
    db = dbInstance.db("mydb");
    console.log("Connected");
  });
};

const getDb = async () => {
  if (!db) {
    await init();
    if (!db) {
      throw new Error("Unable to connect db");
    }
  }
  return db;
};

module.exports = {
  init,
  getDb
};
