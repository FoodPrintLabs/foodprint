var express = require('express');
var router = express.Router();
var passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs');
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files
const upload = multer({ dest: './static/images/produce_images/' }); //path.join(__dirname, 'static/images/produce_images/)

var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

/* Render Login page. */
router.get('/login', function (req, res) {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login', { title: 'FoodPrint - User Login', user: req.user, page_name: 'login' });
  }
});

/* Process Login form submission (File Based Auth). */
/* TODO add a user not found message */
router.post(
  '/login',
  passport.authenticate('file-local', {
    successReturnToOrRedirect: '/',
    successFlash: 'You are now logged in.',
    failureRedirect: '/app/auth/login',
    failureFlash: true,
  }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Render DB Login page. */
router.get('/dblogin', function (req, res) {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('dblogin', {
      title: 'FoodPrint - User Login',
      user: req.user,
      page_name: 'login',
    });
  }
});

/* Process  Login form submission (DB Based Auth). */
/* TODO add a user not found message */
router.post(
  '/dblogin',
  passport.authenticate('db-local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/app/auth/dblogin',
    failureFlash: true,
  }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Logout. */
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You are now logged out.');
  res.redirect('/app/auth/login');
});

/* Render Register page. */
router.get('/register/:message?', function (req, res) {
  // choice
  let choice = req.query.choice;
  choice = typeof choice === 'undefined' ? '' : choice;
  req.params.message
    ? res.render('message', {
        title: 'FoodPrint - User Registration',
        user: req.user,
        page_name: 'message',
        message:
          'Your registration has been submitted. Please check you email to verify your email address.',
      })
    : res.render('register', {
        title: 'FoodPrint - User Registration',
        user: req.user,
        page_name: 'register',
        choice: choice,
      });
  // console.log(req.query)
});

/*Render register_options */
router.get('/register_options', function (req, res) {
  res.render('register_options', {
    title: 'FoodPrint - User Registration',
    user: req.user,
    page_name: 'register',
  });
});

/* Process register form submission . */
router.post('/register', upload.single('registerIDPhoto'), async function (req, res) {
  //TODO - Log registration to table and send email to FoodPrint Admin
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const confirmationCode = jwt.sign({ email: req.body.registerEmail }, process.env.TOKEN_SIGN);

  //res.redirect('/app/auth/register/message');
  try {
    let user = {
      user_uuid: uuidv4(),
      userId: `${req.body.role.charAt(0).toUpperCase()}-${crypto
        .createHash('md5')
        .update(req.body.registerEmail)
        .digest('hex')}`,
      firstName: req.body.registerName,
      middleName: '',
      lastName: req.body.registerSurname,
      phoneNumber: req.body.registerPhoneNumber,
      email: req.body.registerEmail,
      role: req.body.role,
      password: hashedPassword,
      ...(req.body.role === 'farmer' && { farmName: req.body.farmName }),
      ...(req.body.role === 'intermediary' && { organisationName: req.body.registerOrgName }),
      ...(req.body.role === 'intermediary' && { organisationType: req.body.registerOrgType }),
      ...(req.body.role === 'agent' && { city: req.body.city }),
      registrationChannel: 'web',
      emailVerificationToken: confirmationCode,
      isEmailVerified: false,
    };

    const img = req.file;
    if (user.role === 'agent') {
      fs.readFile(img.path, function (err, img_datadata) {
        user['nationalIdPhotoHash'] = img_datadata;
      });
    }

    models.User.create(user)
      .then(_ => {
        models.User.findAll({
          attributes: [
            'ID',
            'firstName',
            'middleName',
            'lastName',
            'phoneNumber',
            'email',
            'role',
            'createdAt',
            'farmName',
            'registrationChannel',
            'nationalIdPhotoHash',
            'organisationName',
            'organisationType',
            'city',
          ],
          where: {
            email: req.body.registerEmail,
          },
        })
          .then(users => {
            if (users.length === 0) {
              res.status(404).send({ message: 'user not found' });
            } else {
              // res.status(201).send(users[0]);

              // TODO change to use gmail
              let transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                  user: process.env.EMAIL_ADDRESS,
                  pass: process.env.EMAIL_PASSWORD,
                },
              });

              transport.sendMail(
                {
                  from: process.env.EMAIL_ADDRESS,
                  to: req.body.registerEmail,
                  subject: 'Foodprint registration confirmation email',
                  html: `<h2>Hi ${req.body.registerName} ${req.body.registerSurname}</h2>
                        <p>Thank you for joining FoodPrint.</p>
                        <p>Please confirm your email by clicking on the following link</p>
                        <a href=http://localhost:3000/app/auth/confirm/${confirmationCode}> Click here</a>
                        </div>`,
                },
                (err, info) => {
                  if (err) {
                    console.log('Error occurred. ' + err.message);
                    // return process.exit(1);
                  }

                  console.log('Message sent: %s', info.messageId);
                  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                }
              );
              res.redirect('/app/auth/register/message');
            }
          })
          .catch(err => {
            console.log(err);
            res.status(400).send({ message: err.message });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
  }
});

router.get('/confirm/:confirmationCode', async function (req, res) {
  models.User.findOne({
    where: {
      emailVerificationToken: req.params.confirmationCode,
    },
  })
    .then(user => {
      if (user) {
        models.User.update(
          { isEmailVerified: true },
          {
            where: {
              emailVerificationToken: req.params.confirmationCode,
            },
          }
        );

        res.render('message', {
          title: 'FoodPrint - User Confirmation',
          user: req.user,
          page_name: 'message',
          message: 'Verification successful',
        });
      } else {
        res.render('message', {
          title: 'FoodPrint - User Confirmation',
          user: req.user,
          page_name: 'message',
          message: 'User not found',
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ error: err, message: 'Unexpected error occurred 😤' });
    });
});

/* Process register for WhatsApp*/
router.post('/register/whatsapp', async function (req, res) {
  try {
    if (req.body.idURL) {
      try {
        const response = await fetch(req.body.idURL);
        req.body.nationalIdPhotoHash = await response.buffer();
        delete req.body.idURL;
      } catch (e) {
        console.log(e);
      }
    }

    models.User.create(req.body)
      .then(_ => {
        models.User.findAll({
          attributes: [
            'ID',
            'firstName',
            'middleName',
            'lastName',
            'email',
            'phoneNumber',
            'role',
            'createdAt',
            'registrationChannel',
          ],
          where: {
            phoneNumber: req.body.phoneNumber,
          },
        })
          .then(users => {
            if (users.length === 0) {
              res.status(404).send({ message: 'user not found' });
            } else {
              res.status(201).send(users[0]);
            }
          })
          .catch(err => {
            console.log(err);
            res.status(400).send({ message: err.message });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
  }
});

/* check user registration status relevent for whatsapp*/
router.get('/register/status/:phoneNumber', function (req, res) {
  const { phoneNumber } = req.params;
  try {
    models.User.findAll({
      attributes: [
        'ID',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phoneNumber',
        'role',
        'createdAt',
        'registrationChannel',
      ],
      where: {
        phoneNumber: phoneNumber,
      },
    })
      .then(users => {
        if (users.length === 0) {
          res.status(404).send({ message: 'user not found' });
        } else {
          res.status(200).send(users[0]);
        }
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
  }
});

module.exports = router;
