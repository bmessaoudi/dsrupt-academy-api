import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import passportJWT from 'passport-jwt'
import endPointFactory, { fileEndPointFactory } from '../endpointFactory'
import _ = require('lodash')
import createHttpError from 'http-errors'
import User, { UserI } from '../model/User'

export const randomString = (length: number) => {
    return crypto.randomBytes(length).toString('hex')
}


export type JwtPayload = {
    id: unknown,
    iat: number,
    exp: number
}

// Strategy
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

declare global {
    namespace Express {
        interface User extends UserI { }
    }
}

passport.serializeUser<any, any>((req, user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).exec().then((user) => {
        done(undefined, user);
    }).catch((err: any) => {
        done(err, undefined);
    });
});

var jwtOptions = Object()
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT

passport.use(new JwtStrategy((jwtOptions), async function (jwtPayload: JwtPayload, done: any) {
    const user = await User.findById(jwtPayload.id);

    if (!user) {
        return done(null, false)
    }

    if (user.security.firstValidToken > jwtPayload.iat) {
        return done(null, false)
    } else {
        return done(null, user)
    }
}))


const authenticateJWT = (req: Request, res: Response, next: NextFunction, shouldThrow: boolean): Promise<UserI> => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err: any, user: UserI) => {
            if ((err || !user) && shouldThrow) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            return resolve(user)
        })(req, res, next)
    })
}

export let isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    let user = await authenticateJWT(req, res, next, true)
    req.user = user
    return next()
}

export let isLogged = async (req: Request, res: Response, next: NextFunction) => {
    let user = await authenticateJWT(req, res, next, false)
    req.user = user
    return next()
}


export const authenticatedEndpointFactory = endPointFactory.use(isAuthenticated, {
    provider: (req) => ({ user: req.user as UserI }),
    transformer: (err) => { throw createHttpError(401, err.message) }
})

export const authenticatedFileEndpointFactory = fileEndPointFactory.use(isAuthenticated, {
    provider: (req) => ({ user: req.user as UserI }),
    transformer: (err) => { throw createHttpError(401, err.message) }
})