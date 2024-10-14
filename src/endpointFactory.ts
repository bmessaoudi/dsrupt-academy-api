import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import { EndpointsFactory, ResultHandler, defaultResultHandler } from 'express-zod-api';
import helmet from 'helmet';
import passport from 'passport';
import { z } from 'zod';
import config from './config';
import moment from 'moment';

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const taggedEndpointsFactory = new EndpointsFactory({
    resultHandler: defaultResultHandler,
    config
})


const fileTaggedEndPointFactory = new EndpointsFactory({
    config,
    resultHandler: new ResultHandler({
        positive: () => ({
            schema: z.string(),
            mimeType: "text/csv",
        }),
        negative: () => ({
            schema: z.string(),
            mimeType: "text/plain",
        }),
        handler: ({ response, error, output }) => {
            if (error) {
                response.status(400).send(error.message);
                return;
            }
            if (output && output.data) {
                const prefix = output.prefix ? `${output.prefix}_` : ''
                response.attachment(`${prefix}${moment().format('DD_MM_YYYY')}.csv`)
                response.status(200).send(output.data as string)
            } else {
                response.status(400).send("Data is missing");
            }
        },
    }),
});

// Different response type form json require a new type of Endpoint Factory
// This is a factory for a file download
// It is not possible to use the same factory for both json and file download
// The middlewares need to be configured in both for this factory too

const [endPointFactory, fileEndPointFactory] = [taggedEndpointsFactory, fileTaggedEndPointFactory,].map(factory =>
    factory.use(urlencodedParser)
        .use(cors())
        .use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        }))
        .use(passport.initialize())
        .use(passport.session())
        .use(helmet())
)


export default endPointFactory
export { fileEndPointFactory };