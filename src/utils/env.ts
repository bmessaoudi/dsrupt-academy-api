import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config()

export type EnvironmentTypeI = 'production' | 'staging' | 'test' | 'development'

export type EnvsI = {
    APP_ENVIRONMENT: EnvironmentTypeI

    MONGODB_URI: string

    JWT: string
    USE_LOGGER: string

    GMAIL_USER: string
    GMAIL_CLIENT_ID: string
    GMAIL_CLIENT_SECRET: string
    GMAIL_REFRESH_TOKEN: string
    GMAIL_ACCESS_TOKEN: string
}

// All app envs
export const env: EnvsI = {
    APP_ENVIRONMENT: (process.env.NODE_ENV || 'development') as EnvironmentTypeI,

    MONGODB_URI: (process.env.MONGODB_URI || 'mongodb://localhost/dsrupt-academy').trim(),

    JWT: process.env.JWT!,
    USE_LOGGER: process.env.USE_LOGGER!,

    GMAIL_USER: process.env.GMAIL_USER!,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID!,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET!,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN!,
    GMAIL_ACCESS_TOKEN: process.env.GMAIL_ACCESS_TOKEN!,
}

function checkEnvs() {
    const elements = Object.keys(env)

    console.log('-------------- ENVS CHECK --------------')

    for (const key of elements) {
        if (!(env as any)[key as any]) {
            console.log(`${colors.red(key)} ❌`)
        } else {
            console.log(`${colors.blue(key)} 🟩`)
        }
    }
    console.log('-------------- ENVS CHECK --------------')
}

checkEnvs()

export const environment: string = process.env.NODE_ENV || 'dev'
export const isDev: boolean = (['development', 'dev', 'staging'].includes(environment))

export default env