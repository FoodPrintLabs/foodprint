var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../src/js/db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));




/* Render Login page. */
router.get('/login',
  function (req, res) {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('login', { title: 'FoodPrint - User Login', user: req.user, page_name: 'login' });
    }
  });

/* Process Login form submission (File Based Auth). */
/* TODO add a user not found message */
router.post('/login',
  passport.authenticate('file-local', {
    successReturnToOrRedirect: '/',
    successFlash: "You are now logged in.",
    failureRedirect: '/app/auth/login',
    failureFlash: true
  }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Process  Login form submission (DB Based Auth). */
/* TODO add a user not found message */
router.post('/dblogin',
  passport.authenticate('db-local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/app/auth/login',
    failureFlash: true
  }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Logout. */
router.get('/logout',
  function (req, res) {
    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/app/auth/login');
  });


/* Render Register page. */
router.get('/register/:message?',
  function (req, res) {
    req.params.message ?
      res.render('message', { title: 'FoodPrint - User Registration', user: req.user, page_name: 'message', message: 'Your registration has been submitted and is currently under review by the FoodPrint Team! You will be notified of status updates via the email you provided.' }) :
      res.render('register', { title: 'FoodPrint - User Registration', user: req.user, page_name: 'register' });
  });

/* Process register form submission . */
router.post('/register',
  function (req, res) {
    //TODO - Log registration to table and send email to FoodPrint Admin
    res.redirect('/app/auth/register/message');
  });


/* Process register for WhatsApp*/
router.post('/register/whatsapp',
  async function (req, res) {
    try {
      if(req.body.idURL) {
          try {
              const response = await fetch(req.body.idURL);
              req.body.nationalIdPhotoHash = await response.buffer();
              delete req.body.idURL;
          } catch(e) {
              console.log(e)
          }
      }

      let sql = "INSERT INTO user SET ?";

      connection.query(sql, req.body, function (err, results) {
        if (err) {
          console.log(err)
          res.status(400).send({ message: err.message });
        } else {
          let sql = "select ID, firstName, middleName, lastName, email, phoneNumber, role, createdAt, registrationChannel from user where phoneNumber = ?";

          connection.execute(sql, [req.body.phoneNumber],
            function (err, users) {
              if (err) {
                console.log(err)
                res.status(400).send({ message: err.message });
              } else if (users.length === 0) {
                res.status(404).send({ message: "user not found" });
              } else {
                res.status(201).send(users[0]);
              }
            });
        }
      });
    } catch (e) {
      console.log(e)
      res.status(500).send({ error: e, message: "Unexpected error occurred 😤"});
    }
  });


/* check user registration status relevent for whatsapp*/
router.get('/register/status/:phoneNumber',
  function (req, res) {
    const { phoneNumber } = req.params
    try {

      let sql = "select ID, firstName, middleName, lastName, email, phoneNumber, role, createdAt, registrationChannel from user where phoneNumber = ?";

      connection.execute(sql, [phoneNumber],
        function (err, users) {
          if (err) {
            console.log(err)
            res.status(400).send({ message: err.message });
          } else if (users.length === 0) {
            res.status(404).send({ message: "user not found" });
          } else {
            res.status(200).send(users[0]);
          }
        });
    } catch (e) {
      console.log(e)
      res.status(500).send({ error: e, message: "Unexpected error occurred 😤"});
    }
  });


module.exports = router;
