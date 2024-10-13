import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.mjs";
import passport from "passport";

const googleOpts = {
  clientID:
    "557623506020-l7ms0lnporos59k0h2osceh23gbub3tj.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/auth/google/callback",
};

const verifyGoogle = async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      console.log(profile);
      console.log(accessToken);
      // const token = generateToken(user);
      console.log(user);

      return done(null, { user, accessToken });
    } else {
      // Create a new user
      user = new User({
        authId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        authType: "google",
        // Add any other fields you want to save
      });
      await user.save();
      return done(null, { user, accessToken });
    }
  } catch (error) {
    console.error("Error in Google verification:", error);
    return done(error, null);
  }
};

// Use strategies

passport.use(new GoogleStrategy(googleOpts, verifyGoogle));
