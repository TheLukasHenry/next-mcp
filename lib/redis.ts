import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", function (err) {
  console.error("Redis Client Error:", err);
});

// Connection management
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const connectRedis = async () => {
  if (isConnected) {
    return client;
  }

  if (connectionPromise) {
    await connectionPromise;
    return client;
  }

  connectionPromise = client.connect().then(() => {
    isConnected = true;
    connectionPromise = null;
  });

  await connectionPromise;
  return client;
};

// Export the Redis client with connection management
export const redis = {
  async set(key: string, value: string) {
    try {
      const redisClient = await connectRedis();
      return await redisClient.set(key, value);
    } catch (error) {
      console.error("setting up Redis failed with error:", error);
      throw error;
    }
  },

  async get(key: string) {
    try {
      const redisClient = await connectRedis();
      return await redisClient.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      throw error;
    }
  },

  async disconnect() {
    if (isConnected) {
      await client.disconnect();
      isConnected = false;
    }
  },
};
