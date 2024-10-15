import mongoose from 'mongoose'
import { UserI } from './User'
import { SurveyI } from './Survey'

export interface AnswerI extends mongoose.Document {
    user: UserI,
    survey: SurveyI,
    answers: string[],
}

const answerSchema = new mongoose.Schema<AnswerI>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', require: true },
        answers: [{ type: String },]
    },
)

const Answer = mongoose.model<AnswerI>('Answer', answerSchema)

export default Answer