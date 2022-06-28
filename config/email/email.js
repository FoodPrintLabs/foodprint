const nodemailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const config = require('../../dbconfig')[env];
const CUSTOM_ENUMS = require('../../utils/enums');
var moment = require('moment'); //datetime
const uuidv4 = require('uuid/v4');
var initModels = require('../../models/init-models');
var sequelise = require('../../config/db/db_sequelise');
const { clearConfigCache } = require('prettier');
var models = initModels(sequelise);

//emailer configuration
// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body
const emailTransport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.WEBAPP_PASSWORD,
  },
});

// test email connection and authentication
console.log('Checking email connection and authentication');
emailTransport
  .verify()
  .then(console.log('Success - email connects and authenticates.'))
  .catch(console.error);

const customSendEmail = function (recipient, subject, body) {
  //check var
  const toCheck = () => {
    return process.env.NODE_ENV == 'development' ? '' + process.env.EMAIL_OVERRIDE : recipient;
  };
  const subjectCheck = () => {
    return process.env.NODE_ENV == 'production'
      ? '[FoodPrint] -' + subject
      : '[FoodPrint Development] -' + subject;
  };
  //Details for email sent to customSendEmail
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toCheck(),
    subject: subjectCheck(),
    html: body,
  };
  let email_logid = uuidv4();
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  emailTransport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error sending email - ', error);
      //res.status.json({ err: error });
      //log to emailModel here
      let data = {
        email_logid: email_logid,
        email_recipient: recipient,
        email_subject: subject,
        email_timestamp: logdatetime,
        email_content: mailOptions.html,
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
      console.log(
        'Success - Email successfully sent. Response - %s, Message ID - %s, email record ID - %s',
        info.response,
        info.messageId,
        email_logid
      );

      //log to emailModel here
      let data = {
        email_logid: email_logid,
        email_recipient: recipient,
        email_subject: subject,
        email_timestamp: logdatetime,
        email_content: mailOptions.html,
        email_status: 'SENT',
      };
      models.FoodprintEmail.create(data)
        .then(_ => {
          console.log('Success - Email saved to DB ' + email_logid);
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
              console.log('Success - Updated email to FAILED status ' + email_logid);
            })
            .catch(err => {
              //throw err;
              console.log('Error - Email record not updated to FAILED status ' + email_logid);
            });
        });
    }
  });
};

module.exports = customSendEmail;
