import mongoose from 'mongoose'

export type QuestionType = 'single' | 'multi' | 'text'

export interface QuestionI extends mongoose.Document {
    title: string,
    question: string,
    options?: string[],
    type: QuestionType
}

const questionSchema = new mongoose.Schema<QuestionI>(
    {
        title: { type: String, require: true },
        question: { type: String, require: true },
        options: [{ type: String }],
        type: { type: String, enum: ['single', 'multi', 'text'] },
    },
)

const Question = mongoose.model<QuestionI>('Question', questionSchema)

export default Question