var createError = require("http-errors");
var express = require("express");
var path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const bcrypt=require("bcryptjs")

const User = require("./models/user");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var messageboardRouter = require("./routes/messageboard");
require('dotenv').config()

const uri = process.env.MONGODB_URI_DEV
 
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//allows the current user to be use in all route that come after this point
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/messageboard", messageboardRouter); // Add catalog routes to middleware chain.
//bcrypt password hashing  /and checking
app.post("/sign-up", async (req, res, next) => {
  //module for adding password hashing
  bcrypt.hash(await req.body.password, 10, async (err, hashedPassword) => {
    // if err, do something
    if (err) {
      return next(err);
    }
    // otherwise, store hashedPassword in DB
    else {
      try {
        const user = new User({
          username: await req.body.username,
          password: hashedPassword,
          privileges: "Non-member",
          isAdmin: await req.body.isAdmin,
        });

        const result = await user.save();
        res.redirect("/");
      } catch (err) {
        return next(err);
      }
    }
  });
});
//login with passport
app.post(
  "/log-in", 
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
    })
);

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
