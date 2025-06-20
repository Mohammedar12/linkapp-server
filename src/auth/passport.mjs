import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.mjs";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import generateToken from "../utils/jwt.mjs";

const publicKey = process.env.PUBLIC_KEY;

let jwtOpts = {};
let cookieExtractor = function (req) {
  if (req && req.cookies && req.cookies["jwt"] && req.cookies["jwt"].token) {
    return req.cookies["jwt"].token;
  } else {
    return null;
  }
};

jwtOpts.jwtFromRequest = cookieExtractor;
jwtOpts.secretOrKey = publicKey;
jwtOpts.algorithms = ["RS256"];

const verifyJwt = async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.sub);
    if (user) {
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

const googleOpts = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "/auth/google/callback",
};

const verifyGoogle = async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      let token = generateToken(user);

      return done(null, { user, token });
    } else {
      // Create a new user
      user = new User({
        authId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        authType: "google",
        isVerified: true,
        // Add any other fields you want to save
      });
      await user.save();

      let token = generateToken(user);
      return done(null, { user, token });
    }
  } catch (error) {
    console.error("Error in Google verification:", error);
    return done(error, null);
  }
};

// Use strategies
passport.use(new JwtStrategy(jwtOpts, verifyJwt));

passport.use(new GoogleStrategy(googleOpts, verifyGoogle));

export default passport;
