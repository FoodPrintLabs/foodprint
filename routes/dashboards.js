var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
var body = require('express-validator'); //validation

var ROLES = require('../utils/roles');
var fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const user = require('../models/user');

var models = initModels(sequelise);

//Initial Render of Admin Dashboard
router.get(
  '/admin',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'DESC']],
      })
        .then(harvest_rows => {
          for (let i = 0; i < harvest_rows.length; i++) {
            harvest_rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(harvest_rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          models.FoodprintStorage.findAll({
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_admin', {
              title: 'FoodPrint - Admin Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('harvestlogbook', {
            page_title: 'FoodPrint - Harvest Logbook',
            data: '',
            user: req.user,
            page_name: 'harvestlogbook',
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

//Render of Admin Dashboard with filtering
router.get(
  '/admin/filter/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'DESC']],
      })
        .then(harvest_rows => {
          for (let i = 0; i < harvest_rows.length; i++) {
            harvest_rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(harvest_rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          models.FoodprintStorage.findAll({
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_admin', {
              title: 'FoodPrint - Admin Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('harvestlogbook', {
            page_title: 'FoodPrint - Harvest Logbook',
            data: '',
            user: req.user,
            page_name: 'harvestlogbook',
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

//Initial Render of Farmer Dashboard
router.get(
  '/farmer',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Farmer) {
      models.FoodprintHarvest.findAll({
        where: {
          harvest_user: req.user.email,
        },
      })
        .then(harvest_rows => {
          for (let i = 0; i < harvest_rows.length; i++) {
            harvest_rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(harvest_rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          models.FoodprintStorage.findAll({
            where: {
              storage_user: req.user.email,
            },
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_farmer', {
              title: 'FoodPrint - Farmer Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('harvestlogbook', {
            page_title: 'FoodPrint - Harvest Logbook',
            data: '',
            user: req.user,
            page_name: 'harvestlogbook',
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

//Render of Farmer Dashboard with FIltering

module.exports = router;
