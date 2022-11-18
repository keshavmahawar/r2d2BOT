var axios = require("axios");

const api = axios.create({
  baseURL: "http://34.28.43.230:80",
  validateStatus(status) {
    return status >= 200 && status < 400;
  },
  headers: {
    "Api-Key":
      "2acfaec46828a12688a70c34c452c5fcb1fdd32d36d70ecff4b59c48384ae5a1",
    "Api-Username": "atuldewangan",
    "Content-Type": "application/json"
  }
});
api.defaults.timeout = 10000;
api.defaults.baseURL = "http://34.28.43.230:80";
// var config = {
//   method: "post",
//   url: "http://34.28.43.230:80/posts.json",
//   data: data
// };

module.exports = api;
