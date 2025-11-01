var express = require('express');
var router = express.Router();
let moment = require('moment');
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
var body = require('express-validator'); //validation
const { Op } = require('sequelize');

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
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'DESC']],
      })
        .then(harvest_rows => {
          models.FoodprintStorage.findAll({
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_admin', {
              title: 'FoodPrint - Admin Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              filter_data: null,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          console.log(err);
          req.flash('error', err);
          res.render('error', {
            message: 'Unexpected error occured',
            data: '',
            user: req.user,
            page_name: 'error',
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
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      //Dates
      let current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let start_date = null;
      let finish_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      if (req.params.range == '1-month') {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '3-month') {
        start_date = moment(current_date).subtract('3', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '6-month') {
        start_date = moment(current_date).subtract('6', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '1-year') {
        start_date = moment(current_date).subtract('1', 'years').format('YYYY-MM-DD HH:mm:ss');
      } else {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
        console.log('Unexpected filter received');
      }

      //Query
      models.FoodprintHarvest.findAll({
        where: {
          harvest_TimeStamp: {
            [Op.between]: [start_date, finish_date],
          },
        },
        order: [['pk', 'DESC']],
      })
        .then(harvest_rows => {
          for (let i = 0; i < harvest_rows.length; i++) {
            harvest_rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(harvest_rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          models.FoodprintStorage.findAll({
            where: {
              market_storageTimeStamp: {
                [Op.between]: [start_date, finish_date],
              },
            },
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_admin', {
              title: 'FoodPrint - Admin Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              filter_data: req.params.range,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('error', {
            message: 'Unexpected Error occured',
            data: '',
            user: req.user,
            page_name: 'error',
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
              filter_data: null,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('error', {
            message: 'Unexpected Error occured',
            data: '',
            user: req.user,
            page_name: 'error',
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

router.get(
  '/farmer/filter/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Farmer) {
      //Dates

      let current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let start_date = null;
      let finish_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      if (req.params.range == '1-month') {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '3-month') {
        start_date = moment(current_date).subtract('3', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '6-month') {
        start_date = moment(current_date).subtract('6', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '1-year') {
        start_date = moment(current_date).subtract('1', 'years').format('YYYY-MM-DD HH:mm:ss');
      } else {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
        console.log('Unexpected filter received');
      }

      //Query
      models.FoodprintHarvest.findAll({
        where: {
          [Op.and]: [
            { harvest_user: req.user.email },
            {
              harvest_TimeStamp: {
                [Op.between]: [start_date, finish_date],
              },
            },
          ],
        },
        order: [['pk', 'DESC']],
      })
        .then(harvest_rows => {
          for (let i = 0; i < harvest_rows.length; i++) {
            harvest_rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(harvest_rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          models.FoodprintStorage.findAll({
            where: {
              [Op.and]: [
                { storage_user: req.user.email },
                {
                  market_storageTimeStamp: {
                    [Op.between]: [start_date, finish_date],
                  },
                },
              ],
            },
            order: [['pk', 'DESC']],
          }).then(storage_rows => {
            res.render('dashboard_farmer', {
              title: 'FoodPrint - Farmer Dashboard',
              harvest_data: harvest_rows,
              storage_data: storage_rows,
              filter_data: req.params.range,
              user: req.user,
              page_name: 'Dashboard',
            });
          });
        })
        .catch(err => {
          req.flash('error', err);
          res.render('error', {
            message: 'Unexpected Error occured',
            data: '',
            user: req.user,
            page_name: 'error',
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

module.exports = router;
