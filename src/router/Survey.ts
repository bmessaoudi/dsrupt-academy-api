import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z from "zod";
import { customZ } from "../utils/user";
import Answer from "../model/Answer";
import Survey from "../model/Survey";
import BackendError from "../utils/BackendError";

class SurveyRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            ':id': {
                '': this.getSurvey,
                'answer': this.answerSurvey
            }
        }
    }

    private getSurvey = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({
            id: customZ.objectId()
        }),
        output: z.object({
            survey: z.any(),
            answers: z.string().array()
        }),
        handler: async ({ input: { id }, options: { user } }) => {
            const survey = await Survey.findById(id)

            if (!survey) {
                throw BackendError('Invalid')
            }

            const answer = await Answer.findOne({ user: user, survey: survey })

            return {
                survey,
                answers: answer?.answers ?? []
            }
        }
    })

    private answerSurvey = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            id: customZ.objectId(),
            answers: z.string().array(),
        }),
        output: z.object({}),
        handler: async ({ input: { id, answers }, options: { user } }) => {

            const survey = await Survey.findById(id)

            if (!survey) {
                throw BackendError('Invalid')
            }

            const answer = new Answer()
            answer.user = user
            answer.survey = survey
            answer.answers = answers

            await answer.save();

            return {}
        },
    })


    public routes() {
        return this.routing;
    }
}

export default new SurveyRouter()