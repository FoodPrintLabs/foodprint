var express = require('express');
var router = express.Router();
var passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs').promises;
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files
const upload = multer({ dest: './static/images/id_images/' }); //path.join(__dirname, 'static/images/produce_images/)

const uuidv4 = require('uuid/v4');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
var ROLES = require('../utils/roles');

var models = initModels(sequelise);

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const customSendEmail = require('../config/email/email');

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
  passport.authenticate(process.env.AUTH_STATEGY ? process.env.AUTH_STATEGY : 'db-local', {
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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const confirmationCode = jwt.sign({ email: req.body.registerEmail }, process.env.TOKEN_SIGN);
  const latestUser =  await models.User.findOne({
    attributes: [ 'ID'],
    order: [[ 'ID', 'DESC' ]],
  });
  const user_uuid = uuidv4();

  try {
    let user = {
      user_uuid: user_uuid,
      userId: `${req.body.role.charAt(0).toUpperCase()}${user_uuid.substring(0,6)}${latestUser?latestUser.ID + 1:0}`,
      firstName: req.body.registerName,
      middleName: '',
      lastName: req.body.registerSurname,
      phoneNumber: req.body.registerPhoneNumber,
      email: req.body.registerEmail,
      role: req.body.role,
      password: hashedPassword,
      ...(req.body.role === ROLES.Farmer && { farmName: req.body.farmName, isAdminVerified: true }),
      ...(req.body.role === ROLES.Intermediary && {
        organisationName: req.body.registerOrgName,
        organisationType: req.body.registerOrgType,
        isAdminVerified: true,
      }),
      ...(req.body.role === ROLES.Agent && { city: req.body.city, isAdminVerified: false }),
      registrationChannel: 'web',
      emailVerificationToken: confirmationCode,
      isEmailVerified: false,
    };

    const img = req.file;
    if (user.role === ROLES.Agent || user.role === ROLES.Farmer) {
      user['nationalIdPhotoHash'] = await fs
        .readFile(img.path)
        .catch(err => console.log('Failed to read file', err));
    }

    models.User.create(user)
      .then(_ => {
        models.User.findOne({
          attributes: [
            'ID',
            'firstName',
            'lastName',
            'email',
          ],
          where: {
            user_uuid: user_uuid,
            email: req.body.registerEmail,
          },
        })
          .then(user => {
            if (user) {
              const mailOptions = {
                to: process.env.TEST_EMAIL_ADDRESS,
                subject: 'Foodprint registration confirmation email',
                html: `<p>Thank you for joining FoodPrint.</p>
                        <p>Please confirm your email by clicking on the following link</p>
                        <a href=${process.env.CONFIRM_URL}/${confirmationCode}> Click here</a>
                        <p>Regards</p>
                        <p>Foodprint Team</p>
                        `,
              };
              try {
                customSendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);
                res.redirect('/app/auth/register/message');
                console.log('Email successfully sent');
              } catch (e) {
                console.log('Error sending email - ', e);
              }
            }
            else {
              res.status(404).send({ message: 'user not found' });
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
