import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z from "zod";
import { getAccountType, userMySchema } from "../utils/user";
import BackendError from "../utils/BackendError";
import User from "../model/User";

class UserRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            my: this.my,
            settings: {
                'change-profile-info': this.changeProfileInfo,
                'change-password': this.changePassword
            }
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
                marketingConsense: user.marketingConsense
            }
        },
        tags: ['user']
    })

    private changeProfileInfo = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            name: z.string(),
            surname: z.string(),
            email: z.string(),
            phone: z.string()
        }),
        output: userMySchema,
        handler: async ({ input: { name, surname, email, phone }, options: { user } }) => {

            if (email.toLocaleLowerCase() !== user.email) {
                const userAlreadyExists = await User.findOne({ email: email?.toLowerCase() });

                if (userAlreadyExists) {
                    throw BackendError('EmailAlreadyRegistered')
                }

                user.email = email
            }

            user.name = name
            user.surname = surname
            user.phone = phone

            await user.save()

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
                marketingConsense: user.marketingConsense
            }
        },
        tags: ['user']
    })

    private changePassword = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            oldPassword: z.string(),
            newPassword: z.string(),
            confirmPassword: z.string(),
        }),
        output: z.object({}),
        handler: async ({ input: { oldPassword, newPassword, confirmPassword }, options: { user } }) => {
            if (newPassword !== confirmPassword) {
                throw BackendError("PasswordsNotMatching");
            }

            if (!(await user.comparePassword(oldPassword))) {
                throw BackendError("WrongPassword");
            }

            user.password = newPassword

            await user.save()

            return {}
        },
        tags: ['user']
    })



    public routes() {
        return this.routing;
    }
}

export default new UserRouter()