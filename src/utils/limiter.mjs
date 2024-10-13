import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  skipSuccessfulRequests: true,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export default limiter;
