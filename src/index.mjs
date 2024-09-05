import express from "express";
import cors from "cors";
import passport from "passport";
// const http = require("http");
import dbConnect from "./config/db.mjs";
import "./auth/passport.mjs";
import user from "./route/user.mjs";
import userSite from "./route/user_site.mjs";
import links from "./route/links.mjs";
import headers from "./route/headers.mjs";

import errorHandler from "./middleware/middleware.mjs";
import auth from "./middleware/passport.mjs";
import cookieParser from "cookie-parser";
import "./services/redis.mjs";

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://192.168.100.32:3000",
    "https://j928fhtn-3000.euw.devtunnels.ms",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use("/", user);
// auth(app);

app.use("/sites", userSite);
app.use("/links", links);
app.use("/headers", headers);

app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log("works !");
  dbConnect();
});
