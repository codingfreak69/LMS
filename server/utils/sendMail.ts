require('dotenv').config();
import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: {[key: string]:any};
}

const sendMail = async (options: EmailOptions): Promise<void> => {
    // Create transporter
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const { email, subject, template, data } = options;

    // Path to the email template file
    const templatePath = path.join(__dirname, '../mails', template);
   

    // Render the email template with EJS
   const html:string = await ejs.renderFile(templatePath,data);

    // Define email options
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html,
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Error Sending Email:", err); // Debug email sending errors
        throw new Error("Failed to send email.");
    }
};

export default sendMail;
