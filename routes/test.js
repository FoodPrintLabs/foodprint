var express = require('express');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const CUSTOM_ENUMS = require('../utils/enums');
var router = express.Router();
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const ROLES = require('../utils/roles');
var models = initModels(sequelise);

//emailer configuration
// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body
let transporter = nodemailer.createTransport({
  service: CUSTOM_ENUMS.GMAIL,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post('/test_qrcode', async (req, res, next) => {
  try {
    // Get the text to generate QR code
    //let qr_txt = req.body.qr_text;
    let produceUrl = 'http://www.google.com';
    let supplier = 'supplier';
    let produce = 'Storage';
    var res2 = await QRCode.toDataURL(produceUrl);
    var QRFileName = supplier + produce;
    QRFileName = QRFileName.trim();
    var QRDirectory = '../static/';
    var QRFullName = QRDirectory + QRFileName + '.png';
    QRFullName = QRFullName.trim();
    console.log('Wrote to ' + res2);
    res.json(res2);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e);
  }
});

//Test Email XmlHTTP request
router.post('/app/testemail', function (req, res) {
  let mailOptions = {
    to: process.env.TEST_EMAIL_ADDRESS,
    subject: 'Test Email',
    html: '<h2>Welcome to FoodPrint</h2><p>This is a test email.</p>',
  };

  transporter.sendMail(mailOptions, function (error, data) {
    if (error) {
      console.log('Error sending email - ', error);
      res.status.json({ err: error });
    } else {
      console.log('Email successfully sent - ', data);
      res.json({ success: true });
    }
  });
});

router.get(
  '/test_db',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  async (req, res, next) => {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      try {
        models.FoodprintHarvest.findAll({
          order: [['pk', 'DESC']],
        })
          .then(rows => {
            console.log('Render SQL results');
            res.render('./test_db', {
              page_title: 'Farmers - FarmPrint',
              data: rows,
              user: req.user,
              page_name: 'testdb',
            });
          })
          .catch(err => {
            //req.flash('error', err);
            console.error('error', err);
            res.render('./test_db', {
              page_title: 'Farmers - Farm Print',
              data: '',
              user: req.user,
              page_name: 'testdb',
            });
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
      }
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        page_name: 'error',
      });
    }
  }
);

module.exports = router;
