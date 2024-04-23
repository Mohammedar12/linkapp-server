const crypto = require("crypto");

const isAuthenticated = (req, res, next) => {
  const sess = req.session;

  const providedToken = req.headers.token;
  const expectedToken = process.env.FRONT_END_TOKEN;

  const tokensMatch = crypto.timingSafeEqual(
    Buffer.from(providedToken),
    Buffer.from(expectedToken)
  );

  if (tokensMatch) {
    if (sess.user) {
      req.user = sess.user;
      console.log("Authenticated user:", req.user);
      next(); // Proceed to the next middleware
    } else {
      console.error("Unauthorized request:", req.headers);
      res.status(401).json({ message: "Unauthorized: session token" });
    }
  } else {
    console.error("Unauthorized request:", req.headers);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = isAuthenticated;
