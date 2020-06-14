const nodemailer = require('nodemailer');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Rental Services <${process.env.EMAIL_FROM}>`
    } 

    createTransport() {
        if(process.env.NODE_ENV === 'production') {

            return 1;
        }

        return nodemailer.createTransport({
            // host: 
        })
    }
}