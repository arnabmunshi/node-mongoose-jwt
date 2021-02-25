const createError = require("http-errors");
const Joi = require("@hapi/joi");

// import models
const User = require("../../models/userModel");
const Login = require("../../models/loginModel");

// import jwt helper
const { signAccessToken } = require("../../helpers/jwtHelper");

// registration validation rules
const authRegistrationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

// login validation rules
const authLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  userRegistration: async (req, res, next) => {
    try {
      // validation
      const validationResult = await authRegistrationSchema.validateAsync(
        req.body
      );

      // email checking
      const userStatus = await User.findOne({ email: validationResult.email });
      if (userStatus)
        throw createError.Conflict(
          `${validationResult.email} is already been registered.`
        );

      // saving
      const user = new User(validationResult);
      const result = await user.save();
      const accessToken = await signAccessToken(result.id);
      res.send({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  userLogin: async (req, res, next) => {
    try {
      // validation
      const validationResult = await authLoginSchema.validateAsync(req.body);

      // email checking
      const user = await User.findOne({ email: validationResult.email });
      if (!user)
        throw createError.NotFound(
          `${validationResult.email} is not registered.`
        );

      // password checking
      const isMatch = await user.isValidPassword(validationResult.password);
      if (!isMatch)
        throw createError.Unauthorized("Email or Password not valid");

      const accessToken = await signAccessToken(user.id);

      // add login details to db
      const login = new Login({ user_id: user.id, access_token: accessToken });
      const result = await login.save();

      res.send({ accessToken, user });
    } catch (err) {
      if (err.isJoi)
        return next(createError.BadRequest("Invalid Username or Password"));
      next(err);
    }
  },

  userLogout: async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) throw createError.BadRequest();

      const result = await Login.deleteOne({ access_token: token });
      if (result.deletedCount === 0) throw createError.Unauthorized();

      res.send({ message: "logout" });
    } catch (err) {
      next(err);
    }
  },
};
