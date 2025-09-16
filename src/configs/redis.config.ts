import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || '';
export const redis_client = createClient({

    url: REDIS_URL

})

redis_client.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redis_client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Could not connect to Redis', error);
    }
}