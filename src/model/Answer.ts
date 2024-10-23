import mongoose from 'mongoose'
import User, { UserI } from './User'
import Survey, { SurveyI } from './Survey'

export interface AnswerI extends mongoose.Document {
    user: UserI,
    survey: SurveyI,
    answers: string[],
}

const answerSchema = new mongoose.Schema<AnswerI>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: User, require: true },
        survey: { type: mongoose.Schema.Types.ObjectId, ref: Survey, require: true },
        answers: [{ type: String },]
    },
)

const Answer = mongoose.model<AnswerI>('Answer', answerSchema)

export default Answer