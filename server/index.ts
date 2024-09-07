import sourceMapSupport from 'source-map-support';
import dotenv from 'dotenv';
import process from 'node:process';
import { remixFastify } from '@mcansh/remix-fastify';
import chalk from 'chalk';
import { fastify } from 'fastify';
import getPort, { portNumbers } from 'get-port';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import ratelimit from '@fastify/rate-limit';
import Redis from 'ioredis';

dotenv.config();
sourceMapSupport.install();

const app = fastify();
const redis = new Redis(process.env.REDIS_URL + '?family=0', { enableAutoPipelining: true });

await app.register(helmet, {
	contentSecurityPolicy: {
		directives: {
			fontSrc: ["'self'", 'fonts.gstatic.com', 'data:'],
			styleSrc: ["'self'", 'fonts.googleapis.com'],
			scriptSrc: ["'self'", "'unsafe-inline'"]
		}
	}
});

await app.register(compress);
await app.register(ratelimit, {
	redis,
	max: 100,
	timeWindow: '1 minute'
});

await app.register(remixFastify);

const host = process.env.HOST || '0.0.0.0';
const desiredPort = Number(process.env.PORT) || 3000;
const portToUse = await getPort({ port: portNumbers(desiredPort, desiredPort + 100) });
const address = await app.listen({ port: portToUse, host });
const { port: usedPort } = new URL(address);

if (usedPort !== String(desiredPort)) {
	console.warn(chalk.yellow(`Port ${desiredPort} is not available, using ${usedPort}.`));
}

console.log(chalk.green(`App is running: ${address}`));
