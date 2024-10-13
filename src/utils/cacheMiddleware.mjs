import client from "./../services/redis.mjs";

const cacheMiddleware = async (req, res, next) => {
  console.log("Entering cacheMiddleware");
  try {
    const key = `__express__${req.originalUrl || req.url}`;
    console.log("Cache key:", key);

    console.log("Attempting to get cached response");
    const cachedResponse = await client.get(key);
    console.log("Cached response:", cachedResponse);

    if (cachedResponse) {
      console.log("Sending cached response");
      return res.json(JSON.parse(cachedResponse));
    }

    console.log("No cached response found, continuing to next middleware");

    // Store the original res.json method
    const originalJson = res.json;

    // Override res.json method
    res.json = function (body) {
      console.log("Intercepted res.json, caching response");
      try {
        client.set(key, JSON.stringify(body), { EX: 60 });
        console.log("Response cached successfully");
      } catch (cacheError) {
        console.error("Error caching response:", cacheError);
      }

      // Call the original json method
      originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error("Cache middleware error:", error);
    next(error); // Pass the error to the error handling middleware
  }
};

export default cacheMiddleware;
