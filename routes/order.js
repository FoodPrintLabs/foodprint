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

//GET order_dashboard
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Buyer || req.user.role === ROLES.Seller) {
      models.Buyer_bid.findAll({
        order: [['pk', 'DESC']],
      })
        .then(bids_rows => {
          models.Seller_offer.findAll({
            order: [['pk', 'DESC']],
          }).then(offer_rows => {
            res.render('order_dashboard', {
              title: 'FoodPrint - Order Dashboard',
              bids_rows: bids_rows,
              offer_rows: offer_rows,
              filter_data: null,
              user: req.user,
              page_name: 'Order Dashboard',
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
