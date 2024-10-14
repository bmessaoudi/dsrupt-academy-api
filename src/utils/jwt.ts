import jwt from 'jsonwebtoken'

import { UserI } from '../model/User'
import { JwtPayload } from '../config/passpost'

const jwtOptions = {
    secretOrKey: process.env.JWT!
}


export function signToken(user: UserI, durationInSeconds: number) {
    const payload: JwtPayload = {
        id: user._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + durationInSeconds
    }

    return jwt.sign(payload, jwtOptions.secretOrKey)
}