import passport from "passport";
import client from "./../services/redis.mjs";

const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = req?.cookies?.jwt?.token;
      if (!token) {
        return res.status(401).json({ message: "Token not provided" });
      }

      const redisUser = await client.get(String(user._id));
      if (!redisUser) {
        next();
      } else {
        const parsedUserData = JSON.parse(redisUser);
        // console.log(redisUser);
        const tokenFromRedis = parsedUserData[String(user._id)];

        if (!tokenFromRedis || !Array.isArray(tokenFromRedis)) {
          return res
            .status(401)
            .json({ message: "Tokens not found or invalid format" });
        }

        const tokenMatch = tokenFromRedis.some(
          (tokenRedis) => tokenRedis === token
        );

        if (tokenMatch) {
          return res
            .status(401)
            .json({ message: "Tokens not found or invalid format" });
        }
      }

      // If everything is okay, proceed to the next middleware/route handler
      next();
    } catch (err) {
      console.error("Error in authentication middleware:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })(req, res, next);
};

export default isAuthenticated;
