import { Documentation, EndpointsFactory, ResultHandler } from "express-zod-api";
import { z } from "zod";
import config from "./config";
import routing from "./routing";


let endpointFactory = new EndpointsFactory({
    resultHandler: new ResultHandler({
        positive: () => ({
            schema: z.string(),
            mimeType: "application/json",
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
                response.send(output.data as string)
            } else {
                response.status(400).send("Data is missing");
            }
        },
    }),
});

const endpoint = endpointFactory.build({
    method: "get",
    input: z.object({}),
    output: z.object({
        data: z.string(),
    }),
    handler: async ({ options, logger }) => {
        const documentation = new Documentation({
            routing, // the same routing and config that you use to start the server
            config,
            version: "1.2.3",
            title: "Example API",
            serverUrl: "https://example.com",
            // composition: "inline", // optional, or "components" for keeping schemas in a separate dedicated section using refs
        });

        logger.info("Generated documentation");

        // logger.debug(yamlString);

        return {
            data: documentation.getSpecAsJson()
        }
    },
})

export default endpoint;