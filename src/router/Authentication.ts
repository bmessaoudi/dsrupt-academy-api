import { Routing } from "express-zod-api";
import endPointFactory from "../endpointFactory";
import { custom, z } from "zod";
import BackendError from "../utils/BackendError";
import User, { UserI } from "../model/User";
import { authenticatedEndpointFactory } from "../config/passpost";
import { getAccountType, loginUser, registerUser, userMySchema } from "../utils/user";
import { signToken } from "../utils/jwt";
import { Permission } from "../config/permissions";

class AutheticationRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            status: this.status,
            login: this.login,
            register: this.register,
            logout: this.logout,
        }
    }

    private status = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({}),
        output: userMySchema,
        handler: async ({ options: { user } }) => {
            const accountType = getAccountType(user)

            if (user.banned) {
                throw BackendError('Banned')
            }

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
        tags: ['auth']
    })

    private login = endPointFactory.build({
        method: 'post',
        input: z.object({
            email: z.string().email(),
            password: z.string(),
            remember: z.boolean().optional(),
        }),
        output: userMySchema.merge(z.object({ token: z.string() })),
        handler: async ({ input: { email, password, remember } }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw BackendError("EmailNotAvailable");
            }

            if (!(await user.comparePassword(password))) {
                throw BackendError("AuthFailed");
            }

            const { token } = loginUser(user, remember);
            const accountType = getAccountType(user)

            user.lastLogin = new Date();
            await user.save();

            return {
                token,
                name: user.name,
                surname: user.surname,
                email: user.email,
                _id: user._id,
                phone: user.phone,
                accountType,
                admin: user.admin,
                lastLogin: user.lastLogin,
            }
        },
        tags: ['auth']
    })

    private register = endPointFactory.build({
        method: 'post',
        input: z.object({
            email: z.string().email(),
            name: z.string(),
            surname: z.string(),
            phone: z.string(),
            password: z.string(),
            passwordConfirm: z.string(),
        }),
        output: userMySchema.merge(z.object({ token: z.string() })),
        handler: async ({ input: { email, name, surname, phone, password, passwordConfirm } }) => {
            if (password !== passwordConfirm) {
                throw BackendError("PasswordsNotMatching");
            }

            const userAlreadyExists = await User.findOne({ email: email?.toLowerCase() });

            if (userAlreadyExists) {
                throw BackendError('AlreadyRegistered')
            }

            const user = await registerUser({ email, name, surname, phone, password, admin: false, permission: Permission.User })

            await user.save();

            const oneYearInSeconds = 31536000;
            const token = signToken(user, oneYearInSeconds);
            const accountType = getAccountType(user)

            return {
                token,
                email: user.email,
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                accountType,
                _id: user._id,
                admin: user.admin,
                lastLogin: user.lastLogin,
            }
        },
        tags: ['auth']
    })

    private logout = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({}),
        output: z.object({}),
        handler: async ({ options: { user } }) => {
            user.security.firstValidToken = Math.floor(Date.now() / 1000);

            await user.save();

            return {};
        },
        tags: ['auth']
    })

    public routes() {
        return this.routing;
    }
}

export default new AutheticationRouter()