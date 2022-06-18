var express = require('express');
const nodemailer = require('nodemailer');
const { check, validationResult, sanitizeParam } = require('express-validator');
var router = express.Router();

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const CUSTOM_ENUMS = require('../utils/enums');
const uuidv4 = require('uuid/v4');

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

//about
router.get('/about', function (req, res) {
  res.render('about', { user: req.user, page_name: 'about' });
});

//produce gallery
router.get('/gallery', function (req, res) {
  res.render('gallery', { user: req.user, page_name: 'gallery' });
});

//farmers
router.get('/farmers', function (req, res) {
  res.render('farmers', { user: req.user, page_name: 'farmers' });
});

//markets
router.get('/markets', function (req, res) {
  res.render('markets', { user: req.user, page_name: 'markets' });
});

//retailers
router.get('/retailers', function (req, res) {
  res.render('retailers', { user: req.user, page_name: 'retailers' });
});

//pricing
router.get('/pricing', function (req, res) {
  res.render('pricing', { user: req.user, page_name: 'pricing' });
});

//food101
router.get('/food101', function (req, res) {
  res.render('food101', { user: req.user, page_name: 'food101' });
});

//tech101
router.get('/tech101', function (req, res) {
  res.render('tech101', { user: req.user, page_name: 'tech101' });
});

//contact
router.get('/contact', function (req, res) {
  res.render('contact', { user: req.user, page_name: 'contact' });
});

//return template for what is at the market this week
router.get(
  '/weekly',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res) {
    res.render('weekly', { user: req.user, page_name: 'weekly' });
  }
);

//return template for how
router.get('/features', function (req, res) {
  res.render('features', { user: req.user, page_name: 'features' });
});

//return template for terms and conditions
router.get('/terms', function (req, res) {
  res.render('termsofuse', { user: req.user, page_name: 'terms' });
});

//return template for privacy policy
router.get('/privacy', function (req, res) {
  res.render('privacypolicy', { user: req.user, page_name: 'privacy' });
});

//subscribe XmlHTTP request
router.post(
  '/subscribe',
  [
    //check('sample_name').not().isEmpty().withMessage('Name must have more than 5 characters'),
    //check('sample_classYear', 'Class Year should be a number').not().isEmpty(),
    //check('weekday', 'Choose a weekday').optional(),
    check('subscribe_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array(), success: false });
    } else {
      // const subscriber_email = req.body.subscribe_email;
      // const subscriber_datetime = new Date();
      // const subscriber_firstname = '';
      // const subscriber_surname = '';
      let data = {
        firstname: '',
        surname: '',
        email: req.body.subscribe_email,
        logdatetime: new Date(),
      };

      try {
        models.FoodprintSubscription.create(data)
          .then(subscriber => res.json({ success: true, email: subscriber.email }))
          .catch(err => {
            console.error('error', err);
            res.status.json({ err: err });
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        res.json({ success: false, errors: e });
      }
    }
  }
);

//contactform XmlHTTP request
router.post(
  '/contactform',
  [
    check('contact_email', 'Contact email is not valid').not().isEmpty().isEmail().normalizeEmail(),
    check('contact_message', 'Contact message should not be empty').not().isEmpty(),
    check('contact_fname', 'Contact first name should not be empty').not().isEmpty(),
    check('contact_lname', 'Contact last name should not be empty').not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array(), success: false });
    } else {
      var contact_email = req.body.contact_email;
      var contact_fname = req.body.contact_fname;
      var contact_lname = req.body.contact_lname;
      var contact_message = req.body.contact_message;
      var contact_datetime = new Date();
      var contact_subject = 'FoodPrint Website Contact Enquiry';
      var contact_message_formatted =
        '<p>Email Sender: ' +
        contact_email +
        '</p><p>Email Message: ' +
        contact_message +
        '</p><br><br><p>Sent from https://www.foodprintapp.com/contact by </p>' +
        contact_fname +
        ' ' +
        contact_lname +
        ' (' +
        contact_datetime +
        ').';

      let mailOptions = {
        to: [process.env.EMAIL_ADDRESS, process.env.TEST_EMAIL_ADDRESS],
        subject: contact_subject,
        html: contact_message_formatted,
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
    }
  }
);

module.exports = router;
