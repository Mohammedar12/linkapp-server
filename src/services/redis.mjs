import { createClient } from "redis";

const client = createClient({
  url: "redis://redis:6379" || "127.0.0.1:6379",
});
// const client = createClient();
client.on("error", (error) => {
  console.error("Redis Error: ", error);
});

client.on("connect", () => {
  console.log("Redis Connected!");
});

client.on("ready", () => {
  console.log("Redis Client Ready");
});

async function connectRedis() {
  try {
    console.log("Connecting to Redis...");
    await client.connect();
    console.log("Redis connection established");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}

connectRedis();

export default client;
