import 'dotenv/config';
import { Redis } from "ioredis";
export const RedisClient = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST
});
//# sourceMappingURL=redis.js.map