import mongoose from 'mongoose'

export interface VideoI extends mongoose.Document {
    title: string,
    description: string,
    src: string,
}

const videoSchema = new mongoose.Schema<VideoI>(
    {
        title: { type: String, require: true },
        description: { type: String, require: true },
        src: { type: String, require: true }
    },
)

const Video = mongoose.model<VideoI>('Video', videoSchema)

export default Video