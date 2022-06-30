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

//GET order_dashboard
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin
    ) {
      models.Buyer_bid.findAll({
        where: {
          bid_status: 'Placed',
        },
        order: [['pk', 'DESC']],
      })
        .then(bid_rows => {
          models.Seller_offer.findAll({
            where: {
              offer_status: 'Placed',
            },
            order: [['pk', 'DESC']],
          }).then(offer_rows => {
            produce_rows = [
              'Baby Marrow',
              'Baby Leeks',
              'Basil',
              'Beetroot',
              'Bergamot',
              'Blood Oranges',
              'Cabbage',
              'Carrots',
              'Cauliflower',
              'Cayenne Pepper',
              'Cucumber',
              'Eggs',
              'Fennel',
              'Granadilla',
              'Green Beans',
              'Herbs',
              'Lebanese Cucumber',
              'Leeks',
              'Lemon',
              'Lettuce',
              'Limes',
              'Mor',
              'Onion',
              'Pak Choi',
              'Parsley',
              'Radish',
              'Sorrel',
              'Swiss Chard',
              'Spinach',
              'Turnips',
            ];
            let finalProduceArray = [];
            if (bid_rows.length || offer_rows.length) {
              finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
            }
            res.render('order_dashboard', {
              title: 'FoodPrint - Order Dashboard',
              bid_rows: bid_rows,
              offer_rows: offer_rows,
              //return list of produce
              produce_rows: finalProduceArray,
              filter_data: '',
              filter_type: '',
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
            filter_data: '',
            filter_type: '',
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

//function returning produce that match orders and offers
function returnRelevantProduce(produce_rows, bid_rows, offer_rows) {
  let produceArray = [];
  for (var i = 0; i < produce_rows.length; i++) {
    for (var k = 0; k < bid_rows.length; k++) {
      if (bid_rows[k].bid_produceName == produce_rows[i]) {
        produceArray.push(produce_rows[i]);
      }
    }
    for (var k = 0; k < offer_rows.length; k++) {
      if (offer_rows[k].offer_produceName == produce_rows[i]) {
        produceArray.push(produce_rows[i]);
      }
    }
  }
  let relevantProduceArray = [];
  return (relevantProduceArray = [...new Set(produceArray)]);
}

//GET filtered dashboard by (PRODUCE)
router.get(
  '/filter/produce/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin
    ) {
      models.Buyer_bid.findAll({
        where: {
          bid_produceName: req.params.range,
          bid_status: 'Placed',
        },
        order: [['pk', 'DESC']],
      })
        .then(bid_rows => {
          models.Seller_offer.findAll({
            where: {
              offer_produceName: req.params.range,
              offer_status: 'Placed',
            },
            order: [['pk', 'DESC']],
          }).then(offer_rows => {
            produce_rows = [
              'Baby Marrow',
              'Baby Leeks',
              'Basil',
              'Beetroot',
              'Bergamot',
              'Blood Oranges',
              'Cabbage',
              'Carrots',
              'Cauliflower',
              'Cayenne Pepper',
              'Cucumber',
              'Eggs',
              'Fennel',
              'Granadilla',
              'Green Beans',
              'Herbs',
              'Lebanese Cucumber',
              'Leeks',
              'Lemon',
              'Lettuce',
              'Limes',
              'Mor',
              'Onion',
              'Pak Choi',
              'Parsley',
              'Radish',
              'Sorrel',
              'Swiss Chard',
              'Spinach',
              'Turnips',
            ];
            let finalProduceArray = [];
            if (bid_rows.length || offer_rows.length) {
              finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
            }
            res.render('order_dashboard', {
              title: 'FoodPrint - Order Dashboard',
              bid_rows: bid_rows,
              offer_rows: offer_rows,
              //return list of produce
              produce_rows: finalProduceArray,
              filter_data: req.params.range,
              filter_type: 'produce',
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
            filter_data: '',
            filter_type: '',
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

//GET filtered dashboard by (Province)
router.get(
  '/filter/province/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin
    ) {
      models.Buyer_bid.findAll({
        where: {
          bid_province: req.params.range,
          bid_status: 'Placed',
        },
        order: [['pk', 'DESC']],
      })
        .then(bid_rows => {
          models.Seller_offer.findAll({
            where: {
              offer_province: req.params.range,
              offer_status: 'Placed',
            },
            order: [['pk', 'DESC']],
          }).then(offer_rows => {
            produce_rows = [
              'Baby Marrow',
              'Baby Leeks',
              'Basil',
              'Beetroot',
              'Bergamot',
              'Blood Oranges',
              'Cabbage',
              'Carrots',
              'Cauliflower',
              'Cayenne Pepper',
              'Cucumber',
              'Eggs',
              'Fennel',
              'Granadilla',
              'Green Beans',
              'Herbs',
              'Lebanese Cucumber',
              'Leeks',
              'Lemon',
              'Lettuce',
              'Limes',
              'Mor',
              'Onion',
              'Pak Choi',
              'Parsley',
              'Radish',
              'Sorrel',
              'Swiss Chard',
              'Spinach',
              'Turnips',
            ];
            let finalProduceArray = [];
            if (bid_rows.length || offer_rows.length) {
              finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
            }
            res.render('order_dashboard', {
              title: 'FoodPrint - Order Dashboard',
              bid_rows: bid_rows,
              offer_rows: offer_rows,
              //return list of produce
              produce_rows: finalProduceArray,
              filter_data: req.params.range,
              filter_type: 'province',
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
            filter_data: '',
            filter_type: '',
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

//GET filtered dashboard by (Time)
router.get(
  '/filter/timeframe/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin
    ) {
      let current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let start_date = null;
      let finish_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      if (req.params.range == 'All') {
        start_date = moment(current_date).subtract('100', 'years').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '1-Week') {
        start_date = moment(current_date).subtract('1', 'weeks').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '1-Month') {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '3-Month') {
        start_date = moment(current_date).subtract('3', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '6-Month') {
        start_date = moment(current_date).subtract('6', 'months').format('YYYY-MM-DD HH:mm:ss');
      } else if (req.params.range == '1-Year') {
        start_date = moment(current_date).subtract('1', 'years').format('YYYY-MM-DD HH:mm:ss');
      } else {
        start_date = moment(current_date).subtract('1', 'months').format('YYYY-MM-DD HH:mm:ss');
        console.log('Unexpected filter received');
      }

      models.Buyer_bid.findAll({
        where: {
          [Op.and]: [
            {
              bid_timeStamp: {
                [Op.between]: [start_date, finish_date],
              },
            },
          ],
          bid_status: 'Placed',
        },
        order: [['pk', 'DESC']],
      })
        .then(bid_rows => {
          models.Seller_offer.findAll({
            where: {
              [Op.and]: [
                {
                  offer_timeStamp: {
                    [Op.between]: [start_date, finish_date],
                  },
                },
              ],
              offer_status: 'Placed',
            },
            order: [['pk', 'DESC']],
          }).then(offer_rows => {
            produce_rows = [
              'Baby Marrow',
              'Baby Leeks',
              'Basil',
              'Beetroot',
              'Bergamot',
              'Blood Oranges',
              'Cabbage',
              'Carrots',
              'Cauliflower',
              'Cayenne Pepper',
              'Cucumber',
              'Eggs',
              'Fennel',
              'Granadilla',
              'Green Beans',
              'Herbs',
              'Lebanese Cucumber',
              'Leeks',
              'Lemon',
              'Lettuce',
              'Limes',
              'Mor',
              'Onion',
              'Pak Choi',
              'Parsley',
              'Radish',
              'Sorrel',
              'Swiss Chard',
              'Spinach',
              'Turnips',
            ];
            let finalProduceArray = [];
            if (bid_rows.length || offer_rows.length) {
              finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
            }
            res.render('order_dashboard', {
              title: 'FoodPrint - Order Dashboard',
              bid_rows: bid_rows,
              offer_rows: offer_rows,
              //return list of produce
              produce_rows: finalProduceArray,
              filter_data: req.params.range,
              filter_type: 'timeframe',
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
            filter_data: '',
            filter_type: '',
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

//GET filtered dashboard by (Status)
router.get(
  '/filter/status/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin
    ) {
      //IF STATUS IS ALL -> Select all
      if (req.params.range == 'All') {
        models.Buyer_bid.findAll({
          order: [['pk', 'DESC']],
        })
          .then(bid_rows => {
            models.Seller_offer.findAll({
              order: [['pk', 'DESC']],
            }).then(offer_rows => {
              produce_rows = [
                'Baby Marrow',
                'Baby Leeks',
                'Basil',
                'Beetroot',
                'Bergamot',
                'Blood Oranges',
                'Cabbage',
                'Carrots',
                'Cauliflower',
                'Cayenne Pepper',
                'Cucumber',
                'Eggs',
                'Fennel',
                'Granadilla',
                'Green Beans',
                'Herbs',
                'Lebanese Cucumber',
                'Leeks',
                'Lemon',
                'Lettuce',
                'Limes',
                'Mor',
                'Onion',
                'Pak Choi',
                'Parsley',
                'Radish',
                'Sorrel',
                'Swiss Chard',
                'Spinach',
                'Turnips',
              ];
              let finalProduceArray = [];
              if (bid_rows.length || offer_rows.length) {
                finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
              }
              res.render('order_dashboard', {
                title: 'FoodPrint - Order Dashboard',
                bid_rows: bid_rows,
                offer_rows: offer_rows,
                //return list of produce
                produce_rows: finalProduceArray,
                filter_data: req.params.range,
                filter_type: 'status',
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
              filter_data: '',
              filter_type: '',
              user: req.user,
              page_name: 'error',
            });
          });
      }
      //IF STATUS IS PLACED OR SETTLED
      else {
        models.Buyer_bid.findAll({
          where: {
            bid_status: req.params.range,
          },
          order: [['pk', 'DESC']],
        })
          .then(bid_rows => {
            models.Seller_offer.findAll({
              where: {
                offer_status: req.params.range,
              },
              order: [['pk', 'DESC']],
            }).then(offer_rows => {
              produce_rows = [
                'Baby Marrow',
                'Baby Leeks',
                'Basil',
                'Beetroot',
                'Bergamot',
                'Blood Oranges',
                'Cabbage',
                'Carrots',
                'Cauliflower',
                'Cayenne Pepper',
                'Cucumber',
                'Eggs',
                'Fennel',
                'Granadilla',
                'Green Beans',
                'Herbs',
                'Lebanese Cucumber',
                'Leeks',
                'Lemon',
                'Lettuce',
                'Limes',
                'Mor',
                'Onion',
                'Pak Choi',
                'Parsley',
                'Radish',
                'Sorrel',
                'Swiss Chard',
                'Spinach',
                'Turnips',
              ];
              let finalProduceArray = [];
              if (bid_rows.length || offer_rows.length) {
                finalProduceArray = returnRelevantProduce(produce_rows, bid_rows, offer_rows);
              }
              res.render('order_dashboard', {
                title: 'FoodPrint - Order Dashboard',
                bid_rows: bid_rows,
                offer_rows: offer_rows,
                //return list of produce
                produce_rows: finalProduceArray,
                filter_data: req.params.range,
                filter_type: 'status',
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
              filter_data: '',
              filter_type: '',
              user: req.user,
              page_name: 'error',
            });
          });
      }
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

//Save bid
router.post(
  '/bid/accept',
  [
    //validation area
    //check('bid_produceName', 'Your produce name is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    console.log(req.body.bid_logid);
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('order_dashboard', {
        page_title: 'FoodPrint - Order Dashboard',
        data: '',
        page_name: 'order_dashboard',
      }); //should add error array here
    } else {
      let data = {
        order_produceName: req.body.bid_produceName,
        order_quantity: req.body.bid_quantity,
        bid_user: req.body.bid_user,
        offer_user: req.user.email,
        order_original_logid: req.body.bid_logid,
        order_logid: uuidv4(),
        order_type: 'Bid',
        order_original_timeStamp: req.body.bid_timeStamp,
        order_timeStamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        order_price: req.body.bid_price,
        order_province: req.body.bid_province,
      };
      try {
        models.My_orders.create(data).then(_ =>
          models.Buyer_bid.update(
            {
              bid_status: 'Settled',
            },
            {
              where: { bid_logid: req.body.bid_logid },
            }
          )
            .then(
              //FOR TESTING EMAILS
              customSendEmail(
                req.user.email,
                'You Accepted a Bid',
                acceptOrderEmail(
                  req.body.bid_produceName,
                  req.body.bid_quantity,
                  req.body.bid_user,
                  req.user.email,
                  req.body.bid_logid,
                  uuidv4(),
                  'Bid',
                  req.body.bid_timeStamp,
                  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  req.body.bid_price,
                  req.body.bid_province,
                  'Seller'
                )
              ),
              customSendEmail(
                req.body.bid_user,
                'Your bid was accepted',
                acceptOrderEmail(
                  req.body.bid_produceName,
                  req.body.bid_quantity,
                  req.body.bid_user,
                  req.user.email,
                  req.body.bid_logid,
                  uuidv4(),
                  'Bid',
                  req.body.bid_timeStamp,
                  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  req.body.bid_price,
                  req.body.bid_province,
                  'Accepted'
                )
              )
            )
            .then(_ => {
              req.flash(
                'success',
                'New order accepted successfully! A order of ' +
                  req.body.bid_produceName +
                  ' has been added to your account.'
              );
              res.redirect('/app/order');
            })
            .catch(err => {
              //throw err;
              req.flash('error', err);
              // redirect to Order page
              res.redirect('/app/order');
            })
        );
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('order_dashboard', {
          page_title: 'FoodPrint - Order Dashboard',
          data: '',
          filter_data: '',
          filter_type: '',
          success: false,
          errors: e.array(),
          page_name: 'order_dashboard',
        });
      }
    }
  }
);

//Save Offer
router.post(
  '/offer/accept',
  [
    //validation area
    //check('bid_produceName', 'Your produce name is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    console.log(req.body.offer_logid);
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('order_dashboard', {
        page_title: 'FoodPrint - Order Dashboard',
        data: '',
        page_name: 'order_dashboard',
      }); //should add error array here
    } else {
      let data = {
        order_produceName: req.body.offer_produceName,
        order_quantity: req.body.offer_quantity,
        offer_user: req.body.offer_user,
        bid_user: req.user.email,
        order_original_logid: req.body.offer_logid,
        order_logid: uuidv4(),
        order_type: 'Offer',
        order_original_timeStamp: req.body.offer_timeStamp,
        order_timeStamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        order_price: req.body.offer_price,
        order_province: req.body.offer_province,
      };
      try {
        models.My_orders.create(data).then(_ =>
          models.Seller_offer.update(
            {
              offer_status: 'Settled',
            },
            {
              where: { offer_logid: req.body.offer_logid },
            }
          )
            .then(
              //FOR TESTING EMAILS
              //EMAIL TO BUYER
              customSendEmail(
                req.user.email,
                'You accepted an offer',
                //body for email
                acceptOrderEmail(
                  req.body.offer_produceName,
                  req.body.offer_quantity,
                  req.body.offer_user,
                  req.user.email,
                  req.body.offer_logid,
                  uuidv4(),
                  'Offer',
                  req.body.offer_timeStamp,
                  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  req.body.offer_price,
                  req.body.offer_province,
                  'Buyer'
                )
              ),
              //EMAIL TO SELLER
              customSendEmail(
                req.body.offer_user,
                'Your offer was accepted',
                acceptOrderEmail(
                  req.body.offer_produceName,
                  req.body.offer_quantity,
                  req.body.offer_user,
                  req.user.email,
                  req.body.offer_logid,
                  uuidv4(),
                  'Offer',
                  req.body.offer_timeStamp,
                  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  req.body.offer_price,
                  req.body.offer_province,
                  'Accepted'
                )
              )
            )
            .then(_ => {
              req.flash(
                'success',
                'New order accepted successfully! A order sale of ' +
                  req.body.offer_produceName +
                  ' has been added to your account.'
              );
              res.redirect('/app/order');
            })
            .catch(err => {
              //throw err;
              req.flash('error', err);
              // redirect to Order page
              res.redirect('/app/order');
            })
        );
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('order_dashboard', {
          page_title: 'FoodPrint - Order Dashboard',
          data: '',
          filter_data: '',
          filter_type: '',
          success: false,
          errors: e.array(),
          page_name: 'order_dashboard',
        });
      }
    }
  }
);

//Render My order logbook
router.get(
  '/myorders',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Buyer ||
      req.user.role === ROLES.Admin ||
      req.user.role === ROLES.Superuser
    ) {
      models.My_orders.findAll({
        where: {
          bid_user: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('myorderlogbook', {
            page_title: 'FoodPrint - Order Logbook',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'myorderlogbook',
          });
        })
        .catch(err => {
          console.log('All myorderlogbook err:' + err);
          req.flash('error', err);
          res.render('myorderlogbook', {
            page_title: 'FoodPrint - Order Logbook',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'myorderlogbook',
          });
        });
    } else if (
      req.user.role === ROLES.Seller ||
      req.user.role === ROLES.Admin ||
      req.user.role === ROLES.Superuser
    ) {
      models.My_orders.findAll({
        where: {
          offer_user: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('myorderlogbook', {
            page_title: 'FoodPrint - Order Logbook',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'myorderlogbook',
          });
        })
        .catch(err => {
          console.log('All myorderlogbook err:' + err);
          req.flash('error', err);
          res.render('myorderlogbook', {
            page_title: 'FoodPrint - Order Logbook',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'myorderlogbook',
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
