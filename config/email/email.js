const nodemailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const config = require('../../dbconfig')[env];
const CUSTOM_ENUMS = require('../../utils/enums');

//emailer configuration
// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body
let emailTransport = nodemailer.createTransport({
  service: CUSTOM_ENUMS.GMAIL,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

customSendEmail = function (recipient, subject, body) {
  //Details for email sent to customSendEmail
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: recipient,
    subject: subject,
    text: body,
  };
  //send Mail with details
  emailTransport.sendMail(mailOptions, function (error, data) {
    if (error) {
      console.log('Error sending email - ', error);
      //res.status.json({ err: error });
      //log to emailModel here
    } else {
      console.log('Email successfully sent - ', data);
      //res.json({ success: true });
      //log to emailModel here
    }
  });
};

module.exports = customSendEmail();
