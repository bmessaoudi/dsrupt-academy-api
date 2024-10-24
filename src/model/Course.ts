import mongoose from 'mongoose'
import Video, { VideoI } from './Video'

export interface CourseI extends mongoose.Document {
    title: string,
    description: string,
    modules: {
        title: string,
        videos: VideoI[]
    }[],
}

const ModuleSchema = new mongoose.Schema({
    title: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

const courseSchema = new mongoose.Schema<CourseI>(
    {
        title: { type: String, require: true },
        description: { type: String, require: true },
        modules: [ModuleSchema],
    },
)

const Course = mongoose.model<CourseI>('Course', courseSchema)

export default Course