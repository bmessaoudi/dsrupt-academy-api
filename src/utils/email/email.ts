import { createTransport } from 'nodemailer'
import env from '../env';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import * as path from 'path';
interface SendEmailI {
    text: string,
    to: string,
    subject: string
}

// TODO: aggiornare template della mail di verifica
export async function sendEmail({ text, to, subject }: SendEmailI) {
    try {
        const transporter = createTransport({
            service: "gmail",
            auth: {
                type: 'OAuth2',
                user: env.GMAIL_USER,
                clientId: env.GMAIL_CLIENT_ID,
                clientSecret: env.GMAIL_CLIENT_SECRET,
                refreshToken: env.GMAIL_REFRESH_TOKEN,
                accessToken: env.GMAIL_REFRESH_TOKEN,
            }
        });

        await transporter.sendMail({
            from: env.GMAIL_USER,
            to: to,
            subject: subject,
            html: text
        });
    } catch (err: any) {
        console.log(err)
    }
}

export async function sendVerificationCodeEmail({ email, code }: { email: string, code: string }) {
    const __dirname = path.resolve();
    const source = readFileSync(__dirname + '/src/utils/email/email.html', 'utf-8').toString();
    const template = compile(source)
    const text = template({ code })
    await sendEmail({ text, to: email, subject: 'Verifica il tuo account' })
}