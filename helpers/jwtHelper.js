const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const Login = require("../models/loginModel");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "1hr",
        issuer: "pickurpage.com",
        audience: userId,
      };

      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyAccessToken: async (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());

    const token = req.headers["authorization"].split(" ")[1];

    // check token is blacklisted or not from db
    const loginDetails = await Login.findOne({ access_token: token });
    if (!loginDetails)
      return next(createError.Unauthorized("Access Token Blackisted"));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        console.log(err.message);
        if (err.name === "TokenExpiredError") {
          return next(createError.Unauthorized("Access Token Expired"));
        } else {
          return next(createError.Unauthorized());
        }
      }

      req.payload = payload;
      next();
    });
  },
};
