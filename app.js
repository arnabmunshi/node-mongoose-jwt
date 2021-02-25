const express = require("express");
const app = express();
const createError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const v1 = require("./src/v1");

// import routes
const authRouter = require("./routes/authRouter");

// enviroment
const dotenv = require("dotenv").config();
const port = process.env.PORT || 3000;

// connect to db
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(`DB connected with host: ${con.connection.host}`);
  })
  .catch((err) => {
    console.log(err.message);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// route middlewares
app.use("/api/v1", v1);

// route error middlewares must be after all routs
// route error middleware
app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist."));
});

// error handler middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
