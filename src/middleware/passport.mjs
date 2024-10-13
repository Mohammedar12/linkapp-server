import passport from "passport";
import client from "./../services/redis.mjs";

const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    console.log(user, "authenticateuser");

    try {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (!user) {
        console.log("No user found in JWT payload");
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      const token = req?.cookies?.jwt?.token;
      if (!token) {
        console.log("No token provided in cookies");
        return res
          .status(401)
          .json({ message: "Unauthorized: Token not provided" });
      }

      console.log(`Checking Redis for user ${user._id}`);
      const redisUser = await client.get(String(user._id));
      if (!redisUser) {
        console.log(`No Redis data found for user ${user._id}`);
        return next(); // Allow the request to proceed if no Redis data (might be first-time login)
      }

      const parsedUserData = JSON.parse(redisUser);
      const tokenFromRedis = parsedUserData[String(user._id)];

      if (!tokenFromRedis || !Array.isArray(tokenFromRedis)) {
        console.log(`Invalid token data in Redis for user ${user._id}`);
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid token data" });
      }

      const tokenMatch = tokenFromRedis.some(
        (tokenRedis) => tokenRedis === token
      );

      if (tokenMatch) {
        console.log(`Token mismatch for user ${user._id}`);
        return res
          .status(401)
          .json({ message: "Unauthorized: Token in Black list" });
      }

      console.log(`User ${user._id} successfully authenticated`);
      req.user = user; // Attach the user object to the request
      next();
    } catch (err) {
      console.error("Error in authentication middleware:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })(req, res, next);
};

export default isAuthenticated;
