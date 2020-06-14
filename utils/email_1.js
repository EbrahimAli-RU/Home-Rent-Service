const nodemailer = require('nodemailer');

const sendEmail = async option => {
    const Transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOption = {
        from: `Rental Service <ebrahimali.cse.ru@gmail.com>`,
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await Transporter.sendMail(mailOption);
}

module.exports = sendEmail;