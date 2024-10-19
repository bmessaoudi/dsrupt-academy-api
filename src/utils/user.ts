import z from "zod";
import { randomString } from "../config/passpost";
import { Permission } from "../config/permissions";
import User, { AccountType, UserI } from "../model/User";
import BackendError from "./BackendError";
import xssFilters from "xss-filters";
import mongoose from "mongoose";
import { signToken } from "./jwt";
import { ez } from "express-zod-api";

export const customZ = {
    objectId: () => z.custom<mongoose.Types.ObjectId | unknown>().or(z.string())
}

export function loginUser(user: UserI, remember = false) {
    const oneHour = 3600;
    const threeHours = 10800;
    const oneYear = 8760 * oneHour;

    if (user.banned) {
        throw BackendError("UserBanned");
    }

    const jwtToken = signToken(user, remember ? oneYear : threeHours);

    return {
        token: jwtToken
    }
}


type RegisterUserProps = {
    email: string,
    name: string,
    surname: string,
    password: string,
    phone: string,
    admin: boolean,
    permission: Permission
    marketingConsense: boolean,
}

export async function registerUser({
    email,
    name,
    surname,
    password,
    phone,
    admin,
    permission,
    marketingConsense,
}: RegisterUserProps) {
    const user = new User();

    user.email = xssFilters.inHTMLData(email?.toLowerCase() ?? "");
    user.name = name
    user.surname = surname
    user.password = password
    user.admin = admin
    user.permission = permission
    user.phone = phone

    user.tos = true
    user.tosDate = new Date()
    user.marketingConsense = marketingConsense

    user.security.pendingPassword = "";
    user.security.lastEmailResend = 0;
    user.security.lastPasswordResend = 0;

    user.security.firstValidToken = Math.floor(Date.now() / 1000);
    user.security.confirmed = randomString(6);

    await user.save().catch((err: any) => {
        console.log(err);
        if (err.name === "MongoServerError" && err.code === 11000) {
            throw BackendError("EmailNotAvailable");
        }
        throw BackendError("Generic");
    });

    return user;
}

export const getAccountType = (user: UserI) => {
    let accountType: AccountType = 'superAdmin'

    const isSuperAdmin = user.isSuperAdmin()
    const isAdmin = user.isAdmin()
    const isUser = user.isUser()

    if (isSuperAdmin) {
        accountType = 'superAdmin'
    } else if (isAdmin) {
        accountType = 'admin'
    } else if (isUser) {
        accountType = 'user'
    }

    return accountType
}

export const userMySchema = z.object({
    id: customZ.objectId(),
    email: z.string(),
    name: z.string(),
    surname: z.string(),
    phone: z.string(),
    accountType: z.string(),
    admin: z.boolean(),
    lastLogin: ez.dateOut().optional(),
    marketingConsense: z.boolean(),
})