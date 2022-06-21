const nodemailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const config = require('../../dbconfig')[env];
const CUSTOM_ENUMS = require('../../utils/enums');
var moment = require('moment'); //datetime
const uuidv4 = require('uuid/v4');
var initModels = require('../../models/init-models');
var sequelise = require('../../config/db/db_sequelise');
var models = initModels(sequelise);

//emailer configuration
// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body
const emailTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.WEBAPP_PASSWORD,
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
  let email_logid = uuidv4();
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  emailTransport.verify().then(console.log).catch(console.error);
  emailTransport.sendMail(mailOptions, function (error, data) {
    if (error) {
      console.log('Error sending email - ', error);
      //res.status.json({ err: error });
      //log to emailModel here
      let data = {
        email_logid: email_logid,
        email_recipient: mailOptions.recipient,
        email_subject: mailOptions.subject,
        email_timestamp: logdatetime,
        email_content: mailOptions.body,
        email_status: 'FAILED',
      };
      models.FoodprintEmail.create(data)
        .then(_ => {
          console.log('Error - Email not sent ' + email_logid);
        })
        .catch(err => {
          //throw err;
          console.log('Error - Failed email not saved ' + email_logid);
        });
    } else {
      console.log('Email successfully sent - ', data);
      //res.json({ success: true });
      //log to emailModel here
      let data = {
        email_logid: email_logid,
        email_recipient: recipient,
        email_subject: subject,
        email_timestamp: logdatetime,
        email_content: body,
        email_status: 'SENT',
      };
      models.FoodprintEmail.create(data)
        .then(_ => {
          console.log('Success - Email sent ' + email_logid);
        })
        .catch(err => {
          //throw err;
          console.log('Error - Email not sent ' + email_logid);
          //Update previous saved email in db
          let data_update = { email_status: 'FAILED' };
          models.FoodprintEmail.update(data_update, {
            where: {
              email_logid: email_logid,
            },
          })
            .then(_ => {
              console.log('Updated email to FAILED status ' + email_logid);
            })
            .catch(err => {
              //throw err;
              console.log('ERROR -Email record not updated to FAILED status ' + email_logid);
            });
        });
    }
  });
};

module.exports = customSendEmail();
