const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const timeSeriesDB = () => {
  mongoose.connect(process.env.MONGO_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  mongoose.connection.on("error", (error) => {
    console.error(`Error Connencting DB: ${error.message}`);
  });
  mongoose.connection.on("open", (error) => {
    error
      ? console.error(`Error Connecting DB: ${error.message}`)
      : console.log("DB CONNECTION SUCCESS");
  });
};
module.exports = {
  timeSeriesDB,
};
