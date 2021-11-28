const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { socketServer } = require("./socketConfig");
const { timeSeriesDB } = require("./time-series-db");
const app = express();
dotenv.config();
// connect to db
timeSeriesDB();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Content-Disposition"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

//server Listener
const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Socket Server launched at::${port}`)
);

// add socket
let socketInit = socketServer(server);
console.log("socketInit", socketInit);
/**for tests */
module.exports = app;
