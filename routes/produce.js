var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
var body = require('express-validator'); //validation
var moment = require('moment'); //datetime
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files
const upload = multer({ dest: './static/images/produce_images/' }); //path.join(__dirname, 'static/images/produce_images/)
var ROLES = require('../utils/roles');
var fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

/* GET Produce page. */
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintProduce.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: rows,
            user: req.user,
            page_name: 'produce',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: '',
            user: req.user,
            page_name: 'produce',
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

/* GET Produce Price Page */
/* GET Produce page. */
router.get(
  '/pricepage',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintProducePrice.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce_price', {
            page_title: 'FoodPrint - Produce Price Page',
            data: rows,
            user: req.user,
            page_name: 'produce price',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('produce_price', {
            page_title: 'FoodPrint - Produce Price Page',
            data: '',
            user: req.user,
            page_name: 'produce price',
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
