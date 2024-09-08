import { createStorage } from 'unstorage';
import redisDriver from 'unstorage/drivers/redis';

const cache = createStorage({
	driver: redisDriver({
		base: 'unstorage',
		url: process.env.REDIS_URL + '?family=0',
		ttl: 3.6e6
	})
});

export default cache;
