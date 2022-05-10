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

//GET Bid dashboard
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Buyer) {
      models.Buyer_bid.findAll({
        where: {
          bid_user: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('buyerlogbook', {
            page_title: 'FoodPrint - Buyer Logbook',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'buyerlogbook',
          });
        })
        .catch(err => {
          console.log('All buyerlogbook err:' + err);
          req.flash('error', err);
          res.render('buyerlogbook', {
            page_title: 'FoodPrint - Buyer Logbook',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'buyerlogbook',
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

//route for save Bid
router.post(
  '/bid/save',
  [
    check('bid_produceName', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('bid_quantity', 'Your quantity is not valid').not().isEmpty().trim().escape(),
    check('bid_unitOfMeasure', 'Your unit of measure is not valid').not().isEmpty().trim().escape(),
    check('bid_price', 'Your bid price is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('buyerlogbook', {
        page_title: 'FoodPrint - Buyer Logbook Page',
        data: '',
        page_name: 'buyerlogbook',
      }); //should add error array here
    } else {
      let data = {
        bid_logid: uuidv4(),
        bid_user: req.user.email,
        bid_produceName: req.body.bid_produceName,
        bid_quantity: req.body.bid_quantity,
        bid_unitOfMeasure: req.body.bid_unitOfMeasure,
        bid_price: 'R' + req.body.bid_price,
        bid_timeStamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        bid_status: 'Placed',
        bid_description: req.body.bid_description,
      };
      try {
        models.Buyer_bid.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New Bid placed successfully! Bid for Produce (' + req.body.bid_produceName + ')'
            );
            res.redirect('/app/buyer');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/buyer');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('buyerlogbook', {
          page_title: 'FoodPrint - Buyer logbook Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'buyerlogbook',
        });
      }
    }
  }
);

module.exports = router;
