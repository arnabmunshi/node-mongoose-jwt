const { boolean } = require("@hapi/joi");
const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Login", loginSchema);
