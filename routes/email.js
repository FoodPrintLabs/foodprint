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
let acceptOrderEmail = require('../config/email/orderEmailTemplate');

//email functionality
let customSendEmail = require('../config/email/email');

const { Op } = require('sequelize');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

//Render email EJS
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintEmail.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('email', {
            page_title: 'FoodPrint - Email Dashboard',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'email',
          });
        })
        .catch(err => {
          console.log('All email err:' + err);
          req.flash('error', err);
          res.render('email', {
            page_title: 'FoodPrint - Email Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'email',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        filter_data: '',
        page_name: 'error',
      });
    }
  }
);

module.exports = router;
