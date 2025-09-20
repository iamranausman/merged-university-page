import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { RESET_PASSWORD_EMAIL_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, OTP_VERIFICATION_EMAIL_TEMPLATE, CONTACT_FORM_TEMPLATE, SUBSCRIPTION_WELCOME_EMAIL } from "../lib/templates/emailTemplates";

export interface EmailOptions {
    email: string;
    verifyCode: string;
}
export interface QueryOption{
    first_name: string;
    last_name: string;
    email: string;
    website: string;
    subject: string;
    message: string;
}
export interface SubscribeOption{
    username: string;
    randomPassword: string;
    email: string;
}
export interface EmailResponse {
    success: boolean;
    message: string;
}
export interface NodemailerResponse {
    accepted: string[];  // Recipients the email was sent to
    rejected: string[];  // Recipients the email was not sent to
    response: string;    // SMTP server response
    envelope: {
        from: string;
        to: string[];
    };
    messageId: string;   // Unique ID of the sent message
}

interface CustomError extends Error {
    code?: string;
    response?: string;
}

/*export const OTPverify = async ({email, verifyCode}: EmailOptions): Promise<NodemailerResponse> => {

    try {

        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.SMTP_PORT,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
            }
        } as SMTPTransport.Options);
        
        const mailOptions = {
        from: process.env.FROM_EMAIL_ADDRESS, // sender address
        to: email, // list of receivers
        subject: "2 Step Verification", // Subject line
        html: OTP_VERIFICATION_EMAIL_TEMPLATE(verifyCode),
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse as NodemailerResponse;

    } catch (error: unknown) {
        // Narrow down the error type
        if (error instanceof Error) {
            const customError = error as CustomError;
            const errorMessage = customError.response
                ? `SMTP Error: ${customError.response}`
                : customError.message;
            throw new Error(errorMessage);
        } else {
            throw new Error("An unknown error occurred during email sending.");
        }
    }

}*/

export const ResetPasswordTemplate = async ({email, verifyCode}: EmailOptions): Promise<NodemailerResponse> => {

    try {

        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.SMTP_PORT || 587,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
            }
        } as SMTPTransport.Options);
        
        const mailOptions = {
        from: process.env.FROM_EMAIL_ADDRESS, // sender address
        to: email, // list of receivers
        subject: "Recover your password", // Subject line
        html: RESET_PASSWORD_EMAIL_TEMPLATE(verifyCode),
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse as NodemailerResponse;

    } catch (error: unknown) {
        // Narrow down the error type
        if (error instanceof Error) {
            const customError = error as CustomError;
            const errorMessage = customError.response
                ? `SMTP Error: ${customError.response}`
                : customError.message;
            throw new Error(errorMessage);
        } else {
            throw new Error("An unknown error occurred during email sending.");
        }
    }

}


/*export const ContactUsQuery = async ({first_name, last_name, email, website, subject, message}: QueryOption): Promise<NodemailerResponse> => {

    try {

        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.SMTP_PORT,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
            }
        } as SMTPTransport.Options);
        
        const mailOptions = {
        from: process.env.FROM_EMAIL_ADDRESS, // sender address
        to: process.env.Admin_Email, // list of receivers
        subject: "Contact Us Query", // Subject line
        html: CONTACT_FORM_TEMPLATE(first_name, last_name, email, website, subject, message),
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse as NodemailerResponse;

    } catch (error: unknown) {
        // Narrow down the error type
        if (error instanceof Error) {
            const customError = error as CustomError;
            const errorMessage = customError.response
                ? `SMTP Error: ${customError.response}`
                : customError.message;
            throw new Error(errorMessage);
        } else {
            throw new Error("An unknown error occurred during email sending.");
        }
    }
};

export const SubscriptionEmail = async ({email, username, randomPassword}: SubscribeOption): Promise<NodemailerResponse> => {

    try {

        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.SMTP_PORT,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
            }
        } as SMTPTransport.Options);
        
        const mailOptions = {
        from: process.env.FROM_EMAIL_ADDRESS, // sender address
        to: email, // list of receivers
        subject: "🎉 Welcome to Our Newsletter!", // Subject line
        html: SUBSCRIPTION_WELCOME_EMAIL(username, randomPassword, email),
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse as NodemailerResponse;

    } catch (error: unknown) {
        // Narrow down the error type
        if (error instanceof Error) {
            const customError = error as CustomError;
            const errorMessage = customError.response
                ? `SMTP Error: ${customError.response}`
                : customError.message;
            throw new Error(errorMessage);
        } else {
            throw new Error("An unknown error occurred during email sending.");
        }
    }
};

export const sendMail = async ({email, verifyCode}: EmailOptions): Promise<NodemailerResponse> => {

    try {

        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.SMTP_PORT,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
            }
        } as SMTPTransport.Options);
        
        const mailOptions = {
        from: process.env.FROM_EMAIL_ADDRESS, // sender address
        to: email, // list of receivers
        subject: "Verify Your Email", // Subject line
        html: VERIFICATION_EMAIL_TEMPLATE(verifyCode),
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse as NodemailerResponse;

    } catch (error: unknown) {
        // Narrow down the error type
        if (error instanceof Error) {
            const customError = error as CustomError;
            const errorMessage = customError.response
                ? `SMTP Error: ${customError.response}`
                : customError.message;
            throw new Error(errorMessage);
        } else {
            throw new Error("An unknown error occurred during email sending.");
        }
    }
};*/