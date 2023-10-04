const nodemailer = require('nodemailer');

function SendMail(Target,subject,body){
    const mailOptions = {
        from: 'omarahmedelnemr10@gmail.com',
        to: Target,
        subject: subject,
        text: body,
      };
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'omarahmedelnemr10@gmail.com',
          pass: 'tntx labi yaes vrcv',
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