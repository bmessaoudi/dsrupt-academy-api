import createHttpError from "http-errors"

export type ValidErrors =
    | 'InvalidPage'
    | 'PasswordsNotMatching'
    | 'UserNotFound'
    | 'AuthFailed'
    | 'InvalidProvider'
    | 'UserBanned'
    | 'AlreadyRegistered'
    | 'TosError'
    | 'Unauthorized'
    | 'SearchTooShort'
    | 'InvalidCursor'
    | 'Generic'
    | 'Invalid'
    | 'Wait'
    | 'EmailNotAvailable'
    | 'Banned'
    | 'PasswordInsecure'
    | 'WrongPassword'
    | 'InvalidCode'
    | 'CodeExpired'
    | 'TooMuchCodeRequest'
    | 'EmailAlreadyRegistered'


const ValidErrorsMsg: {
    [key in ValidErrors]: { code?: number, message: string }
} = {
    'InvalidPage': { message: 'Invalid Page' },
    'PasswordsNotMatching': { message: 'Passwords Not Matching' },
    'AuthFailed': { message: 'Authentication Failed' },
    'InvalidProvider': { message: 'Invalid Provider' },
    'Generic': { message: 'Generic Error' },
    'UserNotFound': { message: 'User Not Found' },
    'UserBanned': { message: 'User Banned' },
    'AlreadyRegistered': { message: 'User already Registered' },
    'TosError': { message: 'ToS not approved' },
    'Unauthorized': { message: 'Unauthorized' },
    'SearchTooShort': { message: 'Search params is too short' },
    'InvalidCursor': { message: 'Invalid pagination cursor' },
    'Wait': { message: 'Wait! Too many requests!' },
    'Invalid': { message: 'Invalid parameters' },
    'EmailNotAvailable': { message: 'Email not available' },
    'Banned': { message: 'Banned' },
    'PasswordInsecure': { message: 'Password Insecure' },
    'WrongPassword': { message: 'Wrong Password' },
    'InvalidCode': { message: 'Invalid Code' },
    'CodeExpired': { message: 'CodeExpired' },
    'TooMuchCodeRequest': { message: 'TooMuchCodeRequest' },
    'EmailAlreadyRegistered': { message: 'EmailAlreadyRegistered' }
}


export default function BackendError(error: ValidErrors, reportToSentry = true, additionalErrors?: Record<string, any>) {
    return createHttpError(ValidErrorsMsg[error].code || 400, error, { reportToSentry, additionalErrors })
}