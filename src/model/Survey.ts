import mongoose from 'mongoose'
import Question, { QuestionI } from './Question'

export interface SurveyI extends mongoose.Document {
    title: string,
    description: string,
    questions: QuestionI[],
}

const surveySchema = new mongoose.Schema<SurveyI>(
    {
        title: { type: String, require: true },
        description: { type: String, require: true },
        questions: [{ type: mongoose.Schema.Types.ObjectId, ref: Question, require: true }],
    },
)

const Survey = mongoose.model<SurveyI>('Survey', surveySchema)

export default Survey