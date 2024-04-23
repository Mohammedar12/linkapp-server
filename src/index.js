const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const uuid = require("node-uuid");

const dbConnect = require("./config/db");

const app = express();
app.use(express.json());

const user = require("./route/user");
const userSite = require("./route/user_site");
const links = require("./route/links");
const headers = require("./route/headers");

const errorHandler = require("./middleware/middleware");

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      mongooseConnection: mongoose.connection,
      collectionName: "sessions",
    }),
    genid: function (req) {
      return uuid.v1();
    },
    cookie: {
      maxAge: process.env.MAX_AGE * 4,
      sameSite: "Lax", // Set SameSite attribute to Lax
    },
  })
);

app.use("/", user);
app.use("/sites", userSite);
app.use("/links", links);
app.use("/headers", headers);
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log("works !");
  dbConnect();
});
