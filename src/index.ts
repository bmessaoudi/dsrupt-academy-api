import './utils/env'
import 'express-async-errors';

import colors from 'colors';
import http from 'http';
import * as mongoose from 'mongoose';

const mongoDbUri: string = (process.env.MONGODB_URI || 'mongodb://localhost/leadmagnet').trim()

import { createServer } from "express-zod-api";
import config from './config';
import routing from './routing';
import { environment } from './utils/env';

try {
    mongoose
        .connect(mongoDbUri)
        .then(() => {
            console.log('connected to mongodb')
        }).catch((err: any) => {
            console.log(err)
            console.log('MongoDB connection error. Please make sure MongoDB is running.')
            process.exit(0)
        })
} catch (error) {
    console.log(error)
    process.exit(0)
}

let startMessage: string = `${colors.rainbow(`[Cluster ${process.pid}] `) + colors.green('online')} environment: ${colors.green(environment)}`
startMessage += ' sentry: '

if (environment === 'production' || environment === 'prod') {
    startMessage += colors.green('enabled')
} else {
    startMessage += colors.red('disabled')
}
startMessage += ' mongo_address: '

if (environment != 'dev') {
    startMessage += colors.green('[hidden]')
} else {
    startMessage += colors.green(mongoDbUri)
}

console.log(startMessage);

(async () => { await createServer(config, routing) })()

