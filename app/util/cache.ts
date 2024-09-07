import { createStorage } from 'unstorage';
import redisDriver from 'unstorage/drivers/redis';
import type { Archive } from './sheets';

const cache = createStorage<Archive[]>({
	driver: redisDriver({
		base: 'unstorage',
		url: process.env.REDIS_URL,
		ttl: 3.6e6
	})
});

export default cache;
