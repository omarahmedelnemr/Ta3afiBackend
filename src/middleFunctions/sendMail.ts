const nodemailer = require('nodemailer');

function SendMail(Target,subject,body){
    const mailOptions = {
        from: process.env.SYSTEM_EMAIL,
        to: Target,
        subject: subject,
        text: body,
      };
      const transporter = nodemailer.createTransport({
        service: process.env.SYSTEM_EMAIL_PROVIDER,
        auth: {
          user: process.env.SYSTEM_EMAIL,
          pass: process.env.SYSTEM_EMAIL_PASSWORD,
        },
      });
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
}

export default SendMail