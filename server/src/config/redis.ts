/**
  Configures and exports a Redis client using the Upstash Redis service.
  - The `Redis` client is initialized with a REST URL and token from environment variables.
  - The configured client is exported for use throughout the application.
 */
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
