import bcrypt from 'bcrypt'
import mongoose, { ObjectId } from 'mongoose'

import { Permission } from '../config/permissions'
import { QuestionI } from './Question';

export type AccountType = 'superAdmin' | 'admin' | 'client' | 'prospect';

export interface UserSecurity {
    confirmed: string;
    pendingPassword: string;
    lastPasswordResend: number;
    lastEmailResend: number;
    firstValidToken: number;
}

export interface UserVerification {
    verified: boolean;
    code: string;
    lastVerifyCode: Date;
}

export interface Answer {
    question: QuestionI
    answer: string
}

export interface UserI extends mongoose.Document {
    _id: ObjectId | string;
    email: string;
    name: string;
    surname: string;
    phone: string;
    password: string;
    security: UserSecurity;
    permission: Permission;
    admin: boolean;
    banned: boolean;
    verification: UserVerification;

    questionsCompleted: boolean;
    answers: Answer[]
    questionsCompletedDate: Date;
    introCompleted: boolean;
    introCompletedDate: Date;
    theoryCompleted: boolean;
    theoryCompletedDate: Date;
    practiceCompleted: boolean;
    practiceCompletedDate: Date;

    createdAt: Date

    comparePassword: (candidatePassword: string, cb?: (err: any, isMatch: any) => {}) => Promise<boolean>
    isSuperAdmin: () => boolean
    isAdmin: () => boolean
    isUser: () => boolean
}

const userSchema = new mongoose.Schema<UserI>(
    {
        email: {
            type: String,
            lowercase: true,
            unique: true
        },
        name: { type: String, default: '' },
        surname: { type: String, default: '' },
        phone: { type: String },
        password: { type: String },
        security: {
            confirmed: String,
            pendingPassword: String,
            lastPasswordResend: Number,
            lastEmailResend: Number,
            firstValidToken: Number
        },
        permission: {
            type: String, default: Permission.User, enum: Object.values(Permission)
        },
        admin: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        verification: {
            verified: { type: Boolean, default: false },
            code: { type: String },
            lastVerifyCode: { type: Date },
        },

        questionsCompleted: { type: Boolean, default: false },
        questionsCompletedDate: { type: Date },
        answers: [{
            question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', require: true },
            answer: { type: String, require: true }
        }],
        introCompleted: { type: Boolean, default: false },
        introCompletedDate: { type: Date },
        theoryCompleted: { type: Boolean, default: false },
        theoryCompletedDate: { type: Date },
        practiceCompleted: { type: Boolean, default: false },
        practiceCompletedDate: { type: Date },
    },
    { timestamps: true }
)

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next: any) {
    // @ts-ignore
    const user: UserI = this

    if (!user.isModified('password')) {
        return next()
    }

    bcrypt.genSalt(10, async (err, salt) => {
        if (err) {
            return next(err)
        }
        const hash = await bcrypt.hash(user.password, salt)
            .catch((err2: mongoose.Error) => {
                if (err2) {
                    return next(err)
                }
            })
        user.password = hash
        next()

    })
})

userSchema.methods.comparePassword = function (candidatePassword: string, cb?: (err: any, isMatch: any) => {}) {
    return new Promise<boolean>(async (res) => {
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
            .catch((err: mongoose.Error) => {
                if (cb) {
                    cb(err, false)
                }

                if (err) {
                    return res(false)
                }
            })
        if (cb) {
            cb(undefined, isMatch)
        }

        if (isMatch !== undefined) {
            return res(isMatch)
        }

    })
}


userSchema.methods.isSuperAdmin = function () {
    if ((this as UserI).permission === Permission.SuperAdmin) {
        return true
    }

    return false
}

userSchema.methods.isAdmin = function () {
    if ((this as UserI).permission === Permission.Admin) {
        return true
    }

    return false
}

userSchema.methods.isUser = function () {
    if ((this as UserI).permission === Permission.User) {
        return true
    }

    return false
}

userSchema.index({ email: 1 });

const User = mongoose.model<UserI>('User', userSchema)

export default User