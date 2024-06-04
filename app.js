// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderdestination";
// const username = process.env.DB_USERNAME;
// const password = process.env.DB_PASSWORD;
// const dburl = `mongodb+srv://${username}:${password}@cluster0.bdnywe5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

//databse connection
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
  // await mongoose.connect(dburl);
}

//render ejs file path in views folder
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOption = {
  secret: "mysecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//home page api
app.get("/", (req, res) => {
  res.send("working");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//store variables in locals to access them in ejs templates also
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//after restructuring routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//test api to add data and create wanderdestination database

// app.get("/testlisting", async(req,res) => {
//     let samplelisting = new Listing({
//         title:'new vila',
//         description:'my new vila by beach',
//         price:1200,
//         location:'Goa',
//         country:'India'
//     });
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("sucess");
// });

app.get("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("server listening to port 3000 ");
});
