import mongoose from 'mongoose'
import { UserI } from './User'
import { CourseI } from './Course'

export interface CourseStatusI extends mongoose.Document {
    user: UserI,
    course: CourseI,
    step: number,
    completed: boolean
}

const courseStatusSchema = new mongoose.Schema<CourseStatusI>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', require: true },
        step: { type: Number, default: 0 },
        completed: { type: Boolean, default: false }
    },
)

const CourseStatus = mongoose.model<CourseStatusI>('CourseStatus', courseStatusSchema)

export default CourseStatus