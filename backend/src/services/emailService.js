const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `Circle Up <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${options.email}`);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
        throw new AppError('Email could not be sent', 500);
    }
};

const getOTPContent = (otp) => {
    const colors = {
        primary: "#6C63FF",
        white: "#ffffff",
        lightBg: "#f8f9fa",
        textDark: "#343a40",
        textLight: "#6c757d",
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Circle Up Verification Code</title>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: ${colors.textDark}; margin: 0; padding: 0; background-color: #f5f7ff; }
                .container { max-width: 600px; margin: 20px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.1); background-color: ${colors.white}; }
                .header { background-color: ${colors.primary}; padding: 30px; text-align: center; }
                .header h1 { color: ${colors.white}; margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px; background-color: ${colors.white}; }
                .otp-container { background-color: ${colors.lightBg}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
                .otp-code { font-size: 32px; letter-spacing: 5px; color: ${colors.primary}; font-weight: bold; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: ${colors.textLight}; background-color: ${colors.lightBg}; }
                .divider { height: 1px; background: linear-gradient(90deg, transparent, ${colors.primary}, transparent); margin: 20px 0; border: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>Circle Up Verification</h1></div>
                <div class="content">
                    <h2 style="margin-top: 0; color: ${colors.primary};">Your Verification Code</h2>
                    <p>Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div class="otp-container">
                        <p style="margin: 0;">Your OTP code is:</p>
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 0;">This code expires in 15 minutes</p>
                    </div>
                    <p>If you didn't request this code, you can safely ignore this email.</p>
                    <div class="divider"></div>
                    <p style="font-size: 14px; color: ${colors.textLight}; margin-top: 20px;">For your security, never share this code with anyone.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Circle Up. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    sendEmail,
    getOTPContent,
};
