// Required Mail Module
const nodemailer = require('nodemailer');

// Main Function
function SendMail(Target,subject,body){

    // Sent Email Info
    const mailOptions = {
        from: process.env.SYSTEM_EMAIL,
        to: Target,
        subject: subject,
        text: body,
    };

    // Create Email Transporter Object with System Email and Password
    const transporter = nodemailer.createTransport({
        service: process.env.SYSTEM_EMAIL_PROVIDER,
        auth: {
            user: process.env.SYSTEM_EMAIL,
            pass: process.env.SYSTEM_EMAIL_PASSWORD,
        },
    });

    // Use the Object to Send Requested Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new Error(`Error sending email:${error}`)
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

export default SendMail