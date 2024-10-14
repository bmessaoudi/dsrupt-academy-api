import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z, { custom } from "zod";
import { FilterQuery, PopulateOptions } from "mongoose";
import User, { UserI } from "../model/User";
import { mongoRegexSearch } from "../utils";
import { PagedFind } from "../utils/pagination";
import { adminEndPointFactory, Permission } from "../config/permissions";
import { customZ } from "../utils/user";
import BackendError from "../utils/BackendError";

class AdminRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            user: {
                list: this.userList,
                ':id': this.getUser
            },
            statistic: {
                subscription: this.statisticSubscription
            }
        }
    }

    private userList = adminEndPointFactory.build({
        method: 'get',
        input: z.object({
            next: z.string().optional(),
            search: z.string().optional(),
        }),
        output: z.object({
            data: z.any(),
            hasNext: z.boolean(),
            next: z.number().nullable(),
            pages: z.number(),
            count: z.number(),
        }),
        handler: async ({ input: { next, search, questionsCompleted, introCompleted, theoryCompleted, practiceCompleted, emailVerified } }) => {

            const sort: any = { createdAt: 'desc' }
            let match: FilterQuery<UserI> = { permission: Permission.User }

            if (search) {
                match = { ...match, $or: mongoRegexSearch(search, ['name', 'surname']) }
            }

            if (questionsCompleted) {
                match = { ...match, questionsCompleted }
            }

            if (introCompleted) {
                match = { ...match, introCompleted }
            }

            if (theoryCompleted) {
                match = { ...match, theoryCompleted }
            }

            if (practiceCompleted) {
                match = { ...match, practiceCompleted }
            }

            if (emailVerified) {
                match = { ...match, 'verification.verified': emailVerified }
            }

            const users = await PagedFind(User, { match, page: next ? +next : 0, sort })

            return {
                ...users,
                data: users.data
            }
        },
        tags: ['admin']
    })

    private statisticSubscription = adminEndPointFactory.build({
        method: 'get',
        input: z.object({}),
        output: z.object({
            countSubscription: z.number(),
            countQuestionary: z.number(),
            countCoursesCompleted: z.number(),
            countTelegramUser: z.number(),
        }),
        handler: async ({ }) => {

            const countSubscription = await User.countDocuments({ permission: Permission.User })

            const countQuestionary = await User.countDocuments({ permission: Permission.User, questionsCompleted: true })

            const countCoursesCompleted = await User.countDocuments({ permission: Permission.User, questionsCompleted: true, introCompleted: true, theoryCompleted: true, practiceCompleted: true })

            const countTelegramUser = await User.countDocuments({ permission: Permission.User, telegramUser: { $exists: true } })

            return {
                countSubscription,
                countQuestionary,
                countCoursesCompleted,
                countTelegramUser
            }
        },
        tags: ['admin']
    })

    private getUser = adminEndPointFactory.build({
        method: 'get',
        input: z.object({
            id: customZ.objectId()
        }),
        output: z.object({
            _id: z.string(),
            email: z.string(),
            name: z.string().optional(),
            surname: z.string().optional(),
            phone: z.string().optional(),
            permission: z.nativeEnum(Permission),
            admin: z.boolean(),
            banned: z.boolean(),
            verification: z.object({
                verified: z.boolean(),
            }),
            questionsCompleted: z.boolean(),
            questionsCompletedDate: z.date().optional(),
            answers: z.array(z.object({
                question: z.object({
                    _id: customZ.objectId(),
                    title: z.string(),
                    question: z.string(),
                    answers: z.array(z.string()),
                    type: z.enum(['single', 'multi', 'text']),
                }),
                answer: z.string(),
            })),
            introCompleted: z.boolean(),
            introCompletedDate: z.date().optional(),
            theoryCompleted: z.boolean(),
            theoryCompletedDate: z.date().optional(),
            practiceCompleted: z.boolean(),
            practiceCompletedDate: z.date().optional(),
            createdAt: z.date(),
        }),
        handler: async ({ input: { id } }) => {
            const user = await User.findById(id).populate(['answers.question', 'telegramUser'])

            if (!user) {
                throw BackendError('Invalid')
            }

            return {
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                password: user.password,
                permission: user.permission,
                admin: user.admin,
                banned: user.banned,
                verification: {
                    verified: user.verification.verified,
                },
                questionsCompleted: user.questionsCompleted,
                questionsCompletedDate: user.questionsCompletedDate,
                answers: user.answers,
                introCompleted: user.introCompleted,
                introCompletedDate: user.introCompletedDate,
                theoryCompleted: user.theoryCompleted,
                theoryCompletedDate: user.theoryCompletedDate,
                practiceCompleted: user.practiceCompleted,
                practiceCompletedDate: user.practiceCompletedDate,
                createdAt: user.createdAt,
            }
        },
        tags: ['admin']
    })


    public routes() {
        return this.routing;
    }
}

export default new AdminRouter()