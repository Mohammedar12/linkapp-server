import passport from "passport";
import client from "./../services/redis.mjs";

const isAuthenticated = (allowedRoles = []) => {
  return async (req, res, next) => {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        try {
          // Check for authentication errors
          if (err) {
            return res.status(500).json({ message: "Internal Server Error" });
          }

          // Verify user exists
          if (!user) {
            return res
              .status(401)
              .json({ message: "Unauthorized: Invalid token" });
          }

          // Check for token in cookies
          const token = req?.cookies?.jwt?.token;
          if (!token) {
            return res
              .status(401)
              .json({ message: "Unauthorized: Token not provided" });
          }

          // Check Redis for token blacklist
          const redisUser = await client.get(String(user._id));
          if (!redisUser) {
            // First-time login or no Redis data
            req.user = user;
            return next();
          }

          const parsedUserData = JSON.parse(redisUser);
          const tokenFromRedis = parsedUserData[String(user._id)];
          console.log(user);

          // Validate token against blacklist
          if (!tokenFromRedis || !Array.isArray(tokenFromRedis)) {
            return res
              .status(401)
              .json({ message: "Unauthorized: Invalid token data" });
          }

          const isTokenBlacklisted = tokenFromRedis.some(
            (tokenRedis) => tokenRedis === token
          );

          if (isTokenBlacklisted) {
            return res
              .status(401)
              .json({ message: "Unauthorized: Token is blacklisted" });
          }

          if (
            allowedRoles.length === 0 ||
            (user.role && allowedRoles.includes(user.role))
          ) {
            req.user = user;
            return next();
          }

          // If user's role is not allowed
          return res.status(403).json({
            message: "Forbidden: Insufficient permissions",
            userRole: user.role,
            allowedRoles: allowedRoles,
          });
        } catch (err) {
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    )(req, res, next);
  };
};

export default isAuthenticated;
