import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/user.mjs";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUB_KEY = fs.readFileSync(__dirname + "/../public_key.pem", "utf8");

let opts = {};

let cookieExtractor = function (req) {
  // console.log(req);
  if (req && req.cookies && req.cookies["jwt"] && req.cookies["jwt"].token) {
    return req.cookies["jwt"].token;
  } else {
    return null;
  }
};
// ...
opts.jwtFromRequest = cookieExtractor;

opts.secretOrKey = PUB_KEY;
opts.algorithms = ["RS256"];

const verfyReq = async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.sub);

    if (user) {
      console.log("wroks passport ", user);

      return done(null, user);
    } else {
      console.log("User not found");
      return done(null, false);
    }
  } catch (error) {
    console.error("Error authenticating user:", error);

    return done(error, false);
  }
};

export default passport.use(new JwtStrategy(opts, verfyReq));
