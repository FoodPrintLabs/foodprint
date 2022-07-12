var express = require('express');
const ROLES = require('../utils/roles');
var router = express.Router();

// const { Op, Sequelize } = require('sequelize');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const upload = multer({ dest: './static/images/id_images/' });

var models = initModels(sequelise);

/*Render user_management */
router.get(
  '/management',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.User.findAll({
        attributes: [
          'user_uuid',
          'firstName',
          'lastName',
          'email',
          'phoneNumber',
          'role',
          'isEmailVerified',
          'isAdminVerified',
        ],
        /*where: {
          role: { [Op.notIn]: [ROLES.Admin, ROLES.Superuser] },
        },*/
      })
        .then(user_rows => {
          res.render('user_management', {
            title: 'FoodPrint - User management',
            user: req.user,
            data: user_rows,
            page_name: 'UMS',
          });
        })
        .catch(err => {
          console.log('All users err:' + err);
          req.flash('error', err);
          res.render('user_management', {
            title: 'FoodPrint - User management',
            user: req.user,
            data: '',
            page_name: 'UMS',
          });
        });
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

router.post(
  '/update',
  upload.none(),
  [
    check('viewmodal_user_firstName', 'User FirstName value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_lastName', 'User Lastname value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_email', 'User email value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_user_phoneNumber', 'User phone number value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_role', 'User role value is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    const errors = result.errors;
    for (let key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }

    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.redirect('/app/user/management');
    } else {
      let data = {
        firstName: req.body.viewmodal_user_firstName,
        lastName: req.body.viewmodal_user_lastName,
        email: req.body.viewmodal_user_email,
        phoneNumber: req.body.viewmodal_user_phoneNumber,
        role: req.body.viewmodal_user_role,
        isAdminVerified: req.body.viewmodal_user_profile,
      };

      try {
        models.User.update(data, {
          where: {
            user_uuid: req.body.viewmodal_user_uuid,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'User entry updated successfully! User UUID = ' + req.body.viewmodal_user_uuid
            );
            res.redirect('/app/user/management');
          })
          .catch(err => {
            console.log('Error - Update User failed');
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/app/user/management');
          });
      } catch (e) {
        next(e);
        res.redirect('/app/user/management');
      }
    }
  }
);

router.post(
  '/save',
  upload.none(),
  [
    check('viewmodal_user_firstName', 'User FirstName value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_lastName', 'User Lastname value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_email', 'User email value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_user_phoneNumber', 'User phone number value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_password', 'User phone number value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_user_role', 'User role value is not valid').not().isEmpty().trim().escape(),
  ],
  async function (req, res) {
    const result = validationResult(req);
    const errors = result.errors;
    for (let key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }

    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.redirect('/app/user/management');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.viewmodal_user_password, salt);
      const confirmationCode = jwt.sign(
        { email: req.body.viewmodal_user_email },
        process.env.TOKEN_SIGN
      );
      const latestUser = await models.User.findOne({
        attributes: ['ID'],
        order: [['ID', 'DESC']],
      });
      const user_uuid = uuidv4();
      const data = {
        user_uuid: user_uuid,
        userId: `${req.body.viewmodal_user_role.charAt(0).toUpperCase()}${user_uuid.substring(
          0,
          6
        )}${latestUser ? latestUser.ID + 1 : 0}`,
        firstName: req.body.viewmodal_user_firstName,
        lastName: req.body.viewmodal_user_lastName,
        email: req.body.viewmodal_user_email,
        phoneNumber: req.body.viewmodal_user_phoneNumber,
        role: req.body.viewmodal_user_role,
        isAdminVerified: req.body.viewmodal_user_profile,
        isEmailVerified: true,
        password: hashedPassword,
        emailVerificationToken: confirmationCode,
      };

      try {
        models.User.create(data)
          .then(_ => {
            req.flash('success', 'User entry added successfully');
            res.redirect('/app/user/management');
          })
          .catch(err => {
            console.log('Error - Add User failed');
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/app/user/management');
          });
      } catch (e) {
        next(e);
        res.redirect('/app/user/management');
      }
    }
  }
);

router.post(
  '/delete',
  upload.none(),
  [check('viewmodal_user_uuid', 'User ID value is not valid').not().isEmpty().trim().escape()],
  function (req, res) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.User.destroy({
        where: {
          user_uuid: req.body.viewmodal_user_uuid,
        },
      })
        .then(_ => {
          req.flash(
            'success',
            'User entry deleted successfully! User ID = ' + req.body.viewmodal_user_uuid
          );
          res.redirect('/app/user/management');
        })
        .catch(err => {
          req.flash('error', err.message);
          res.redirect('/app/user/management');
        });
    } else {
      req.flash('error', 'Not authorised');
      res.redirect('/app/user/management');
    }
  }
);

module.exports = router;
