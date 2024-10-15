import { Routing } from "express-zod-api";
import documentationEndpoint from "./documentation";
import Authentication from "./router/Authentication";
import User from "./router/User";
import Admin from "./router/Admin";
import Survey from "./router/Survey";
import Course from "./router/Course";

const routing: Routing = {
    v1: {
        user: User.routes(),
        auth: Authentication.routes(),
        admin: Admin.routes(),
        survey: Survey.routes(),
        course: Course.routes(),
    },
};

routing.swagger = documentationEndpoint

export default routing;