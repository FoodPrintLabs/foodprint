var express = require('express');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const CUSTOM_ENUMS = require('../utils/enums');
var router = express.Router();
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const ROLES = require('../utils/roles');

//email functionality
let customSendEmail = require('../config/email/email');

var models = initModels(sequelise);

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
  try {
    customSendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);
    console.log('Email successfully sent');
    res.json({ success: true });
  } catch (e) {
    console.log('Error sending email - ', e);
    res.status.json({ err: e });
  }
});

router.get(
  '/test_config',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  async (req, res, next) => {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      try {
        models.FoodprintHarvest.findAll({
          order: [['pk', 'DESC']],
        })
          .then(rows => {
            console.log('Render SQL results');
            res.render('./test_config', {
              page_title: 'Farmers - FarmPrint',
              data: rows,
              user: req.user,
              page_name: 'test_config',
            });
          })
          .catch(err => {
            //req.flash('error', err);
            console.error('error', err);
            res.render('./test_config', {
              page_title: 'Configuration Testing',
              data: '',
              user: req.user,
              page_name: 'test_config',
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
