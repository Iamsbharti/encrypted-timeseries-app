const mongoose = require("mongoose");
let userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  timestamp_minute: Date,
  type: String,
  values: {
    type: [Object],
    default: function () {
      return Array(60).fill(0);
    },
  },
  timeseries: {
    timeField: Date,
    metaField: Object,
    granularity: String,
  },
});
module.exports = mongoose.model("User", userSchema);
