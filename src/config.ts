import { createConfig } from "express-zod-api";
import pino, { Logger } from "pino";

function normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val

    if (isNaN(port)) {
        return val
    } else if (port >= 0) {
        return port
    }

    throw new Error(`Invalid port: ${port}`)
}

const config = createConfig({
    server: {
        listen: normalizePort(4000),
        upload: true,
        compression: true,
    },
    cors: true,
    logger: pino({
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    }),
    startupLogo: false,
    tags: {
        auth: "Authentication endpoints",
        user: "User endpoints",
        admin: 'Admin endpoints',
        test: "Test endpoints"
    }
});

// Setting the type of logger used
declare module "express-zod-api" {
    interface LoggerOverrides extends Logger { }
}

export default config;