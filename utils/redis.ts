import { createClient, RedisClientType } from "redis";
import { getErrorMessage } from "../oplog/error";
import oplog from "../oplog/oplog";

// Initialize Redis client using environment variables
const redisClient: RedisClientType = createClient({
	url: `redis${process.env.REDIS_CLOUD_TLS === "true" ? "s" : ""}://${process.env.REDIS_CLOUD_USERNAME}:${
		process.env.REDIS_CLOUD_PASSWORD
	}@${process.env.REDIS_CLOUD_HOST}:${process.env.REDIS_CLOUD_PORT}`,
});

// Handle connection events
redisClient.on("connect", () => {
	oplog.info("Connected to Redis Cloud");
});

redisClient.on("error", (err) => {
	oplog.error(`Redis connection error: ${getErrorMessage(err)}`);
});

redisClient.on("end", () => {
	oplog.info("Redis connection closed");
});

// Connect to Redis when the module is loaded
(async () => {
	try {
		await redisClient.connect();
	} catch (err) {
		oplog.error(`Failed to connect to Redis: ${getErrorMessage(err)}`);
	}
})();

// Export the Redis client
export default redisClient;
