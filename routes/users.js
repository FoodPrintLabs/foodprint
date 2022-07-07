var express = require('express');
const ROLES = require('../utils/roles');
var router = express.Router();

const { Op, Sequelize } = require('sequelize');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

/*Render user_management */
router.get('/management',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res) {

    if (
      req.user.role === ROLES.Admin ||
      req.user.role === ROLES.Superuser
    ) {

      models.User.findAll({
        attributes: [
          'firstName',
          'lastName',
          'email',
          'phoneNumber',
          'role',
          'isEmailVerified',
          'isAdminVerified'
        ],
        where: {
          role: {[Op.notIn]:[ROLES.Admin, ROLES.Superuser]}
        }
      }).then( user_rows => {
        res.render('user_management', {
          title: 'FoodPrint - User management',
          user: req.user,
          data: user_rows,
          page_name: 'UMS',
        });
      }).catch(err => {
        console.log('All users err:' + err);
        req.flash('error', err);
        res.render('user_management', {
          title: 'FoodPrint - User management',
          user: req.user,
          data: '',
          page_name: 'UMS',
        });
      })

    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        page_name: 'error',
      });
    }
});

module.exports = router;
