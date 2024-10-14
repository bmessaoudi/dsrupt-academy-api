import { NextFunction, Request, Response } from 'express'
import { IOSchema, Middleware } from 'express-zod-api'
import { UserI } from '../model/User'
import { z } from 'zod'
import BackendError from '../utils/BackendError'
import { authenticatedEndpointFactory } from './passpost'

export type PermissionEnum = 'user.base' | 'admin.base' | 'admin.super'

export enum Permission {
    User = 'user.base',
    Admin = 'admin.base',
    SuperAdmin = 'admin.super',
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
    //@ts-ignore
    if (!req.user || ![Permission.SuperAdmin, Permission.Admin].includes(req.user.permission)) {
        return res.status(404).json({})
    }

    return next()
}

export const isAdminMiddleware = new Middleware<IOSchema<"strip">, { user: UserI }, {}, ''>({
    input: z.object({}),
    handler: async ({ options }) => {
        if (!options.user || ![Permission.SuperAdmin, Permission.Admin].includes(options.user.permission) || !options.user.admin) {
            throw BackendError('Unauthorized')
        }
        return {}
    }
})

export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
    //@ts-ignore
    if (!req.user || !req.user.permissions.includes(Permission.SuperAdmin)) {
        throw res.status(404).json({})
    }

    return next()
}

export const isSuperAdminMiddleware = new Middleware<IOSchema<"strip">, { user: UserI }, {}, ''>({
    input: z.object({}),
    handler: async ({ options }) => {
        if (!options.user || options.user.permission !== Permission.SuperAdmin || !options.user.admin) {
            throw BackendError('Unauthorized')
        }
        return {}
    }
})


export const adminEndPointFactory = authenticatedEndpointFactory
    .addMiddleware(isAdminMiddleware)