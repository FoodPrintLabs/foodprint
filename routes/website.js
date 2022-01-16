var express = require('express');
const nodemailer = require("nodemailer");
const {check, validationResult, sanitizeParam} = require("express-validator");
var router = express.Router();

var initModels = require("../models/init-models");
var sequelise = require('../src/js/db_sequelise');
const CUSTOM_ENUMS = require("../src/js/enums");
const uuidv4 = require("uuid/v4");

var models = initModels(sequelise);

//emailer configuration
let transporter = nodemailer.createTransport({
  service: CUSTOM_ENUMS.GMAIL,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

//about
router.get('/about', function (req, res) {
  res.render('about', {user: req.user, page_name: 'about'});
});

//produce gallery
router.get('/gallery', function (req, res) {
  res.render('gallery', {user: req.user, page_name: 'gallery'});
});

//farmers
router.get('/farmers', function (req, res) {
  res.render('farmers', {user: req.user, page_name: 'farmers'});
});

//markets
router.get('/markets', function (req, res) {
  res.render('markets', {user: req.user, page_name: 'markets'});
});

//retailers
router.get('/retailers', function (req, res) {
  res.render('retailers', {user: req.user, page_name: 'retailers'});
});

//pricing
router.get('/pricing', function (req, res) {
  res.render('pricing', {user: req.user, page_name: 'pricing'});
});

//food101
router.get('/food101', function (req, res) {
  res.render('food101', {user: req.user, page_name: 'food101'});
});

//tech101
router.get('/tech101', function (req, res) {
  res.render('tech101', {user: req.user, page_name: 'tech101'});
});


//contact
router.get('/contact', function (req, res) {
  res.render('contact', {user: req.user, page_name: 'contact'});
});

//return template for what is at the market this week
router.get('/weekly',
  require('connect-ensure-login').ensureLoggedIn({redirectTo: '/app/auth/login'}),
  function (req, res) {
    res.render('weekly', {user: req.user, page_name: 'weekly'});
  });

//return template for how
router.get('/how', function (req, res) {
  res.render('how', {user: req.user, page_name: 'how'});
});

//return template for terms and conditions
router.get('/terms', function (req, res) {
  res.render('termsofuse', {user: req.user, page_name: 'terms'});
});

//return template for privacy policy
router.get('/privacy', function (req, res) {
  res.render('privacypolicy', {user: req.user, page_name: 'privacy'});
});

//subscribe XmlHTTP request
router.post('/subscribe', [
    //check('sample_name').not().isEmpty().withMessage('Name must have more than 5 characters'),
    //check('sample_classYear', 'Class Year should be a number').not().isEmpty(),
    //check('weekday', 'Choose a weekday').optional(),
    check('subscribe_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({errors: errors.array(), success: false});
    } else {
      // const subscriber_email = req.body.subscribe_email;
      // const subscriber_datetime = new Date();
      // const subscriber_firstname = '';
      // const subscriber_surname = '';
      let data = {
        firstname: '',
        surname: '',
        email: req.body.subscribe_email,
        logdatetime: new Date()
      }

      try {
        models.FoodprintSubscription
          .create(data)
          .then(subscriber => res.json({success: true, email: subscriber.email}))
          .catch(err => {
            console.error('error', err);
            res.status.json({err: err});
          });


        /*connection.execute('\n' +
            'INSERT INTO foodprint_subscription (\n' +
            '        firstname ,\n' +
            '        surname,\n' +
            '        email,\n' +
            '        logdatetime)\n' +
            'VALUES (?, ?, ?, ?);',
            [
                subscriber_firstname,
                subscriber_surname,
                subscriber_email,
                subscriber_datetime
            ], function (err, rows) {
                if (err) {
                    //req.flash('error', err);
                    console.error('error', err);
                    res.status.json({err: err});
                } else {
                    console.log('add foodprint_subscription DB success');
                    res.json({success: true, email: subscriber_email});
                }
            });*/
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        res.json({success: false, errors: e});
      }
    }
  });


//contactform XmlHTTP request
router.post('/contactform', [
    check('contact_email', 'Contact email is not valid').not().isEmpty().isEmail().normalizeEmail(),
    check('contact_message', 'Contact message should not be empty').not().isEmpty(),
    check('contact_fname', 'Contact first name should not be empty').not().isEmpty(),
    check('contact_lname', 'Contact last name should not be empty').not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({errors: errors.array(), success: false});
    } else {
      var contact_email = req.body.contact_email;
      var contact_fname = req.body.contact_fname;
      var contact_lname = req.body.contact_lname;
      var contact_message = req.body.contact_message;
      var contact_datetime = new Date();
      var contact_subject = "FoodPrint Website Contact Enquiry";
      var contact_message_formatted = "<p>Email Sender: " + contact_email +
        "</p><p>Email Message: " + contact_message +
        "</p><br><br><p>Sent from https://www.foodprintapp.com/contact by </p>" +
        contact_fname + " " + contact_lname + " (" + contact_datetime + ")."

      let mailOptions = {
        to: [process.env.EMAIL_ADDRESS, process.env.TEST_EMAIL_ADDRESS],
        subject: contact_subject,
        html: contact_message_formatted
      };

      transporter.sendMail(mailOptions, function (error, data) {
        if (error) {
          console.log("Error sending email - ", error);
          res.status.json({err: error});
        } else {
          console.log("Email successfully sent - ", data);
          res.json({success: true});
        }
      });
    }
  });


//market checkin XmlHTTP request
router.post('/marketcheckin', [
    check('checkin_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({errors: errors.array(), success: false});
    } else {
      var checkin_market_id = req.body.checkin_market_id;
      var checkin_email = req.body.checkin_email;
      var checkin_datetime = new Date();
      var checkin_firstname = '';
      var checkin_surname = '';

      let data = {
        market_id: checkin_market_id,
        firstname: checkin_firstname,
        surname: checkin_surname,
        email: checkin_email,
        logdatetime: checkin_datetime,
      }
      try {

        models.MarketSubscription
          .create(data)
          .then(_ => {
            console.log('add market_subscription DB success');
            res.json({success: true, email: checkin_email});
          })
          .catch( err => {
            //req.flash('error', err);
            console.error('error', err);
            res.status.json({err: err});
          })
        /*connection.execute('\n' +
          'INSERT INTO market_subscription (\n' +
          '        market_id ,\n' +
          '        firstname,\n' +
          '        surname,\n' +
          '        email,\n' +
          '        logdatetime)\n' +
          'VALUES (?, ?, ?, ?, ?);',
          [
            checkin_market_id,
            checkin_firstname,
            checkin_surname,
            checkin_email,
            checkin_datetime
          ], function (err, rows) {
            if (err) {
              //req.flash('error', err);
              console.error('error', err);
              res.status.json({err: err});
            } else {
              console.log('add market_subscription DB success');
              res.json({success: true, email: checkin_email});
            }
          });*/
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e)
        res.json({success: false, errors: e});
      }
    }
  });


//return template with market checkin form e.g. http://localhost:3000/checkin/ozcf
router.get('/checkin/:market_id', [sanitizeParam('market_id').escape().trim()], function (req, res) {
  var boolCheckinForm = process.env.SHOW_CHECKIN_FORM || false
  var marketID = req.params.market_id; //shortcode e.g. ozcf
  var logid = uuidv4()
  var qrid = '' //TODO this is not yet being tracked in config
  var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;
  var request_host = req.get('host')
  var request_origin = req.headers.referer
  //req.headers.referer - The Referer request header contains the address of the previous web page
  //from which a link to the currently requested page was followed.
  //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.

  //alternative would have been to use origin request header
  //The Origin request header indicates where a fetch originates from.

  var request_useragent = req.headers['user-agent']
  var logdatetime = new Date();

  //TODO - cross check marketID against existing marketID's from foodprint_market

  try {

    let data = {
      logid: logid,
      qrid: qrid,
      qrurl: qrurl,
      marketID: marketID,
      request_host: request_host,
      request_origin: request_origin,
      request_useragent: request_useragent,
      logdatetime: logdatetime
    }

    models.FoodprintQrcount
      .create(data)
      .then(() => {
        console.log('Market checkin tracking successful');
        //res.json({ success: true, email: checkin_email });
      })
      .catch(err => {
        //req.flash('error', err);
        //console.error('error', err)
        console.error('Market checkin tracking error occured');
        // res.status.json({ err: err });
      })

    /*connection.execute('\n' +
      'INSERT INTO foodprint_qrcount (\n' +
      '        logid ,\n' +
      '        qrid,\n' +
      '        qrurl,\n' +
      '        marketid,\n' +
      '        request_host,\n' +
      '        request_origin,\n' +
      '        request_useragent,\n' +
      '        logdatetime)\n' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [
        logid,
        qrid,
        qrurl,
        marketID,
        request_host,
        request_origin,
        request_useragent,
        logdatetime
      ], function (err, rows) {
        if (err) {
          //req.flash('error', err);
          //console.error('error', err)
          console.error('Market checkin tracking error occured');
          // res.status.json({ err: err });
        } else {
          console.log('Market checkin tracking successful');
          //res.json({ success: true, email: checkin_email });
        }
      });*/
  } catch (e) {
    //TODO log the error
    //this will eventually be handled by your error handling middleware
    //next(e)
    //res.json({success: false, errors: e});
    //console.error('error', err)
    console.error('Market checkin tracking error occured');
    res.render('checkin.ejs', {data: marketID, showCheckinForm: boolCheckinForm, user: req.user, page_name: 'checkin'});
  }
  res.render('checkin.ejs', {data: marketID, showCheckinForm: boolCheckinForm, user: req.user, page_name: 'checkin'});
});


module.exports = router;
