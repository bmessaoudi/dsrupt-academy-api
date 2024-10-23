import mongoose from 'mongoose'
import Video, { VideoI } from './Video'

export interface CourseI extends mongoose.Document {
    title: string,
    description: string,
    videos: VideoI[],
}

const courseSchema = new mongoose.Schema<CourseI>(
    {
        title: { type: String, require: true },
        description: { type: String, require: true },
        videos: [{ type: mongoose.Schema.Types.ObjectId, ref: Video, require: true }],
    },
)

const Course = mongoose.model<CourseI>('Course', courseSchema)

export default Course