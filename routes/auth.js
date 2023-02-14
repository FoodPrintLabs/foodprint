import { getUploadParams, resolveFilenames, uploadConnection } from '../config/digitalocean/file-upload';

var express = require('express');
var router = express.Router();
var passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

const BucketName = process.env.DO_BUCKET_NAME;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tw_client = require('twilio')(accountSid, authToken);

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

/* Process  Login form submission (DB Based Auth). */
/* TODO add a user not found message */
router.post(
  '/dblogin',
  passport.authenticate('db-local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/app/auth/login',
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
  req.params.message
    ? res.render('message', {
        title: 'FoodPrint - User Registration',
        user: req.user,
        page_name: 'message',
        message:
          'Your registration has been submitted and is currently under review by the FoodPrint Team! You will be notified of status updates via the email you provided.',
      })
    : res.render('register', {
        title: 'FoodPrint - User Registration',
        user: req.user,
        page_name: 'register',
      });
});

/* Process register form submission . */
router.post('/register', function (req, res) {
  //TODO - Log registration to table and send email to FoodPrint Admin
  res.redirect('/app/auth/register/message');
});

/* Process register for WhatsApp*/
router.post('/register/whatsapp', async function (req, res) {
  try {
    if (req.body.idURL) {
      try {
        const response = await fetch(req.body.idURL);
        const id_hash = await response.buffer();
        req.body.nationalIdPhotoHash = id_hash;

        const twilio_url = req.body.idURL
        const [accountID, messageID, mediaID] = twilio_url.split("/").slice(4).filter((_, index) => index % 2 === 1);

        tw_client.messages(messageID)
          .media(mediaID)
          .fetch()
          .then(media => {

            const contentType = media.contentType
            const [fileType, ext] = contentType.split("/");

            const filenames = resolveFilenames(
              `${req.body.firstName}_${req.body.lastName}_${req.body.phoneNumber.replace("+", "")}`.toLowerCase(),
              `.${ext}`
            );
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
                console.log('File uploaded ' + filenames.fileUrl);
                req.body.user_identifier_image_url = filenames.fileUrl;
              }
            });
          });

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


router.get(
  '/migratewhatsappusers',
  require('connect-ensure-login')
    .ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.User.findAll({
        order: [['ID', 'DESC']],
      })
        .then(rows => {
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].nationalIdPhotoHash === null) {
              console.log(`no image for user ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`);
            } else {
              try {
                const filenames = resolveFilenames(
                  `${req.body.firstName}_${req.body.lastName}_${req.body.phoneNumber.replace("+", "")}`.toLowerCase(),
                  '.jpg');
                const uploadParams = getUploadParams(
                  BucketName,
                  'image/jpg',
                  Buffer.from(rows[i].nationalIdPhotoHash, 'binary'),
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
                        console.log(`updated image for ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`);
                      })
                      .catch(err => {
                        //throw err;
                        console.log('Error - Update Harvest failed');
                        console.log(err);
                      });
                  }
                });
              } catch (e) {
                console.log(`error on user ${rows[i].ID} - ${rows[i].firstName} ${rows[i].lastName}`);
              }
            }
          }
          res.json({ message: 'success' });
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
