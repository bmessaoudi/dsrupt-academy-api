import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z from "zod";
import { getAccountType, userMySchema } from "../utils/user";

class UserRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            my: this.my,
        }
    }

    private my = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({}),
        output: userMySchema,
        handler: async ({ options: { user } }) => {
            const accountType = getAccountType(user)

            return {
                id: user._id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                accountType: accountType,
                admin: user.admin,
                lastLogin: user.lastLogin,
            }
        },
        tags: ['user']
    })


    public routes() {
        return this.routing;
    }
}

export default new UserRouter()