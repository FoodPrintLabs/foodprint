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

//GET seller dashboards
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Seller) {
      models.Seller_offer.findAll({
        where: {
          offer_user: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('sellerlogbook', {
            page_title: 'FoodPrint - Seller Logbook',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'sellerlogbook',
          });
        })
        .catch(err => {
          console.log('All sellerlogbook err:' + err);
          req.flash('error', err);
          res.render('sellerlogbook', {
            page_title: 'FoodPrint - Seller Logbook',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'sellerlogbook',
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

//GET Filtered seller dashboard
router.get(
  '/filter/produce/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Seller) {
      //Query
      models.Seller_offer.findAll({
        where: {
          offer_produceName: req.params.range,
          offer_user: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('sellerlogbook', {
            page_title: 'FoodPrint - Seller Logbook Page',
            data: rows,
            user: req.user,
            filter_data: req.params.range,
            page_name: 'sellerlogbook',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('sellerlogbook', {
            page_title: 'FoodPrint - Seller Logbook Page',
            data: '',
            user: req.user,
            filter_data: '',
            page_name: 'sellerlogbook',
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

//route for save Offer
router.post(
  '/offer/save',
  [
    check('offer_produceName', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('offer_quantity', 'Your quantity is not valid').not().isEmpty().trim().escape(),
    check('offer_unitOfMeasure', 'Your unit of measure is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('offer_price', 'Your offer price is not valid').not().isEmpty().trim().escape(),
    check('offer_province', 'Your offer province is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('sellerlogbook', {
        page_title: 'FoodPrint - Seller Logbook Page',
        data: '',
        page_name: 'sellerlogbook',
      }); //should add error array here
    } else {
      let data = {
        offer_logid: uuidv4(),
        offer_user: req.user.email,
        offer_produceName: req.body.offer_produceName,
        offer_quantity: req.body.offer_quantity,
        offer_unitOfMeasure: req.body.offer_unitOfMeasure,
        offer_price: 'R' + req.body.offer_price,
        offer_province: req.body.offer_province,
        offer_timeStamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        offer_status: 'Placed',
        offer_description: req.body.offer_description,
      };
      try {
        models.Seller_offer.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New Offer placed successfully! Offer for Produce (' +
                req.body.offer_produceName +
                ')'
            );
            res.redirect('/app/seller');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/seller');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('sellerlogbook', {
          page_title: 'FoodPrint - Seller logbook Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'sellerlogbook',
        });
      }
    }
  }
);

module.exports = router;
