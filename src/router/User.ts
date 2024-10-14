import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z from "zod";
import { getAccountType, userMySchema } from "../utils/user";

class UserRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            my: this.my,
            "complete-step": this.completeStep
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
                questionsCompleted: user.questionsCompleted,
                introCompleted: user.introCompleted,
                theoryCompleted: user.theoryCompleted,
                practiceCompleted: user.practiceCompleted,
                emailVerified: user.verification.verified
            }
        },
        tags: ['user']
    })

    private completeStep = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            step: z.enum(['intro', 'theory', 'practice'])
        }),
        output: z.object({}),
        handler: async ({ input: { step }, options: { user } }) => {

            if (step === 'intro') {
                user.introCompleted = true
                user.introCompletedDate = new Date()
            }

            if (step === 'theory') {
                user.theoryCompleted = true
                user.theoryCompletedDate = new Date()
            }

            if (step === 'practice') {
                user.practiceCompleted = true
                user.practiceCompletedDate = new Date()
            }

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