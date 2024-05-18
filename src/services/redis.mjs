import { createClient } from "redis";

const client = createClient();

client.on("error", (error) => {
  console.log("Redis Error: ", error);
});

client.on("connect", () => {
  console.log("Redis Connected!");
});

(async () => {
  console.log("Connecting to Redis...");
  await client.connect();
})();

export default client;
