const path = require('path');
const nodemailer = require('nodemailer');
const { host, port, user, pass } = require('../config/mail.json');


const hbs = require('nodemailer-express-handlebars');

let options = {
    viewEngine: 'handlebars',
    viewPath: path.resolve('./resources/mail/auth/'),
    extName: '.html',
}

transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
});

transport.use('compile', hbs(options))

module.exports = transport;