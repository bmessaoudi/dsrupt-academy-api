import { Routing } from "express-zod-api";
import documentationEndpoint from "./documentation";
import Authentication from "./router/Authentication";
import User from "./router/User";
import Admin from "./router/Admin";

const routing: Routing = {
    v1: {
        user: User.routes(),
        auth: Authentication.routes(),
        admin: Admin.routes(),
    },
};

routing.swagger = documentationEndpoint

export default routing;