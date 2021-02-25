const express = require("express");
const app = express();
const authRouter = require("../../routes/authRouter");
const { verifyAccessToken } = require("../../helpers/jwtHelper");

app.use("/auth", authRouter);
app.use("/", verifyAccessToken, async (req, res, next) => {
  res.send("/");
});

module.exports = app;
