const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { socketServer } = require("./socketConfig");
const { timeSeriesDB } = require("./time-series-db");
const { getAllData, getFilterData } = require("./library");

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

if (process.env.NODE_ENV === "production") {
  // api routes
  app.get("/payload", function (req, res) {
    getAllData(res);
  });
  app.get("/search/payload", function (req, res) {
    console.log(req.params.search);
    getFilterData(req.query.search, res);
  });
  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../client-enc/build")));

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", function (request, response) {
    response.sendFile(
      path.resolve(__dirname, "../client-enc/build", "index.html")
    );
  });
}

//server Listener
const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Socket Server launched at::${port}`)
);

// add socket
let socketInit = socketServer(server);
console.log("socketInit", socketInit);

// api routes
app.get("/payload", function (req, res) {
  getAllData(res);
});
app.get("/search/payload", function (req, res) {
  console.log(req.params.search);
  getFilterData(req.query.search, res);
});
/**for tests */
module.exports = app;
