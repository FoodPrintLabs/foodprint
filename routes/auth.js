var express = require('express');
var router = express.Router();
var passport = require('passport');
var ROLES = require('../utils/roles');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs').promises;
const multer = require('multer');
const upload = multer({ dest: './static/images/id_images/' });

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
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You are now logged out.');
    res.redirect('/app/auth/login');
  });
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
  const latestUser = await models.User.findOne({
    attributes: ['ID'],
    order: [['ID', 'DESC']],
  });
  const user_uuid = uuidv4();

  try {
    let user = {
      user_uuid: user_uuid,
      userId: `${req.body.role.charAt(0).toUpperCase()}${user_uuid.substring(0, 6)}${
        latestUser ? latestUser.ID + 1 : 0
      }`,
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
          attributes: ['ID', 'firstName', 'lastName', 'email'],
          where: {
            user_uuid: user_uuid,
            email: req.body.registerEmail,
          },
        })
          .then(user => {
            if (user) {
              const mailOptions = {
                to: req.body.registerEmail,
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
            } else {
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
  const createUser = function (user_entry) {
    models.User.create(user_entry)
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
            phoneNumber: user_entry.phoneNumber,
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
  };

  try {
    if (req.body.idURL) {
      try {
        const response = await fetch(req.body.idURL);
        const id_hash = await response.buffer();
        req.body.nationalIdPhotoHash = id_hash;

        const twilio_url = req.body.idURL;
        const [accountID, messageID, mediaID] = twilio_url
          .split('/')
          .slice(4)
          .filter((_, index) => index % 2 === 1);

        tw_client
          .messages(messageID)
          .media(mediaID)
          .fetch()
          .then(media => {
            const contentType = media.contentType;
            const [fileType, ext] = contentType.split('/');
            const image_name = uuidv4();
            const filenames = resolveFilenames(image_name, `.${ext}`);
            const uploadParams = getUploadParams(
              BucketName,
              contentType,
              id_hash,
              'public-read',
              filenames.filename
            );

            uploadConnection.upload(uploadParams, function (error, data) {
              if (error) {
                console.error(error);
              } else {
                // console.log('File uploaded ' + filenames.fileUrl);
                req.body.user_identifier_image_url = filenames.fileUrl;
                createUser(req.body);
              }
            });
          });

        delete req.body.idURL;
      } catch (e) {
        console.log(e);
      }
    } else {
      // console.log(req.body);
      createUser(req.body);
    }
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

router.get(
  '/migratewhatsappusers',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.User.findAll({
        order: [['ID', 'ASC']],
      })
        .then(rows => {
          let message = 'completed successfully';
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].nationalIdPhotoHash === null) {
              console.log(
                `no image for user ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`
              );
            } else {
              try {
                const imageBuffer = Buffer.from(rows[i].nationalIdPhotoHash, 'binary');
                const metadata = getMimeType(imageBuffer);
                const image_name = uuidv4();
                const filenames = resolveFilenames(image_name, metadata.ext);
                const uploadParams = getUploadParams(
                  BucketName,
                  metadata.contentType,
                  imageBuffer,
                  'public-read',
                  filenames.filename
                );
                uploadConnection.upload(uploadParams, function (error, data) {
                  if (error) {
                    console.error(error);
                  } else {
                    console.log('File uploaded ' + filenames.fileUrl);
                    const user_entry = {
                      user_identifier_image_url: filenames.fileUrl,
                    };

                    models.User.update(user_entry, {
                      where: {
                        ID: rows[i].ID,
                      },
                    })
                      .then(_ => {
                        console.log(
                          `updated image for ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`
                        );
                      })
                      .catch(err => {
                        //throw err;
                        console.log('Error - Update user failed');
                        console.log(err);
                        message = 'completed with errors please check console';
                      });
                  }
                });
              } catch (e) {
                console.log(e);
                console.log(
                  `error on user ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`
                );
                message = 'completed with errors please check console';
              }
            }
          }
          res.json({ message: message });
        })
        .catch(err => {
          console.log('All user err:' + err);
          res.json({ error: err });
        });
    } else {
      res.json({ message: 'not authorised' });
    }
  }
);

module.exports = router;
