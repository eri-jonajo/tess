require('dotenv').config();
var nodemailer = require('nodemailer');
var mysql = require('mysql');
const { WebClient } = require('@slack/client');

module.exports = {
    send_email: function () {
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_SENDER,
                    pass: process.env.EMAIL_SENDERPASS
                }
            });

            console.log(emailBody);
            // setup email data with unicode symbols
            var mailOptions = {
                from: '"Error Checker" <tess@theofe.com>', // sender address
                to: process.env.EMAIL_TOALL, // list of receivers
                subject: 'Batch Error', // Subject line
                text: emailBody, // plain text body
                html: emailBody.replace(/\n/g, '<br/>\n') // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
            });
        });
    },

    send_slack: function (opt) {
        opt = Object.assign({
            channel: process.env.SLACK_ALL,
            text: ''
        }, opt)

        console.log('Sending slack to: ' + opt.channel);
        var token = process.env.SLACK_TOKEN;
        var slack = new WebClient(token);

        // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID

        // See: https://api.slack.com/methods/chat.postMessage
        slack.chat.postMessage({ channel: opt.channel, text: opt.text, as_user: false, username: 'TESS' })
            .then((res) => {
                // `res` contains information about the posted message
                console.log('Message sent: ', res.ts);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}