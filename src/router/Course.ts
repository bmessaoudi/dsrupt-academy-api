import { Routing } from "express-zod-api";
import { authenticatedEndpointFactory } from "../config/passpost";
import z from "zod";
import { customZ } from "../utils/user";
import Course from "../model/Course";
import BackendError from "../utils/BackendError";
import CourseStatus from "../model/CourseStatus";

class CourseRouter {
    routing: Routing;

    constructor() {
        this.routing = {
            all: this.listAll,
            course: {
                ':id': {
                    '': this.getCourse,
                    'status': this.getCourseStatus,
                    'start': this.startCourse,
                    'update-status': this.updateStatus
                }
            },
        }
    }

    private listAll = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({}),
        output: z.object({
            courses: z.any().array()
        }),
        handler: async () => {

            const courses = await Course.find()

            return {
                courses
            }
        }
    })

    private getCourse = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({
            id: customZ.objectId()
        }),
        output: z.object({
            title: z.string(),
            description: z.string(),
            videos: z.any(),
        }),
        handler: async ({ input: { id } }) => {

            const course = await Course.findById(id).populate(['videos', 'survey'])

            if (!course) {
                throw BackendError('Invalid')
            }

            return {
                title: course.title,
                description: course.description,
                videos: course.videos
            }
        }
    })

    private getCourseStatus = authenticatedEndpointFactory.build({
        method: 'get',
        input: z.object({
            id: customZ.objectId()
        }),
        output: z.object({
            step: z.number(),
            completed: z.boolean(),
        }),
        handler: async ({ input: { id }, options: { user } }) => {

            const status = await CourseStatus.findOne({ user: user, course: id })

            if (!status) {
                throw BackendError('Invalid')
            }

            return {
                step: status.step,
                completed: status.completed,
            }
        }
    })

    private startCourse = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            id: customZ.objectId()
        }),
        output: z.object({}),
        handler: async ({ input: { id }, options: { user } }) => {

            const course = await Course.findById(id)

            if (!course) {
                throw BackendError('Invalid')
            }

            const status = new CourseStatus()
            status.user = user
            status.course = course

            await status.save()

            return {}
        }
    })

    private updateStatus = authenticatedEndpointFactory.build({
        method: 'post',
        input: z.object({
            id: customZ.objectId(),
            complete: z.boolean().optional()
        }),
        output: z.object({}),
        handler: async ({ input: { id, complete }, options: { user } }) => {

            const course = await Course.findById(id)

            if (!course) {
                throw BackendError('Invalid')
            }

            const status = await CourseStatus.findOne({ user: user, course: id })

            if (!status) {
                throw BackendError('Invalid')
            }

            if (status.completed) {
                throw BackendError('Invalid')
            }

            if (complete) {
                status.completed = complete
            } else {
                status.step = status.step + 1
            }

            await status.save()

            return {}
        }
    })


    public routes() {
        return this.routing;
    }
}

export default new CourseRouter()