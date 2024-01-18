import dotenv from 'dotenv';
dotenv.config();
import nodeMailer from 'nodemailer'

let transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465 , false for other ports,
    auth: {
        user: process.env.EMAIL_USER, // Admin 
        pass: process.env.EMAIL_PASS
    } ,   
})



export default transporter;