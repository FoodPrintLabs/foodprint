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
            filter_data: '',
            page_name: 'produce',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'produce',
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

//Filter for Produce Page
router.get(
  '/filter/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      //Query
      models.FoodprintProduce.findAll({
        where: {
          produce_type: req.params.range,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: rows,
            user: req.user,
            filter_data: req.params.range,
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

//route for insert data
router.post(
  '/save',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_type', 'Your produce Type is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('produce', {
        page_title: 'FoodPrint - Produce Page',
        data: '',
        page_name: 'produce',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_type: req.body.produce_type,
      };
      try {
        models.FoodprintProduce.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New Produce added successfully! Produce Name = ' + req.body.produce_name
            );
            res.redirect('/app/produce');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/produce');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('produce', {
          page_title: 'FoodPrint - Produce Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'produce',
        });
      }
    }
  }
);

//route for update data
router.post(
  '/update',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_type', 'Your produce type is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('produce', {
        page_title: 'FoodPrint - Produce Page',
        data: '',
        page_name: 'produce',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_type: req.body.produce_type,
      };
      try {
        models.FoodprintProduce.update(data, {
          where: {
            pk: req.body.pk,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Produce updated successfully! Produce Name = ' + req.body.produce_name
            );
            res.redirect('/app/produce');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to produce page
            res.redirect('/app/produce');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors:errors.array()});
        res.render('produce', {
          page_title: 'FoodPrint - Produce Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'produce',
        });
      }
    }
  }
);

//route for delete data
router.post('/delete', (req, res) => {
  models.FoodprintProduce.destroy({
    where: {
      pk: req.body.pk2,
    },
  })
    .then(_ => {
      req.flash(
        'success',
        'Produce deleted successfully! Produce Name = ' + req.body.produce_name2
      );
      res.redirect('/app/produce');
    })
    .catch(err => {
      //throw err;
      req.flash('error', err);
      // redirect to Produce page
      res.redirect('/app/produce');
    });
});

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
            filter_data: '',
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
            filter_data: '',
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

//Filter for Pricepage
router.get(
  '/pricepage/filter/:range',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      //Query
      models.FoodprintProducePrice.findAll({
        where: {
          produce_province: req.params.range,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce_price', {
            page_title: 'FoodPrint - Produce Price Page',
            data: rows,
            user: req.user,
            filter_data: req.params.range,
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
            filter_data: '',
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

//route for insert data
router.post(
  '/pricepage/save',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_price', 'Your produce price is not valid').not().isEmpty().trim().escape(),
    check('produce_province', 'Your province is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('pricepage', {
        page_title: 'FoodPrint - Price Page',
        data: '',
        page_name: 'pricepage',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_price: 'R' + req.body.produce_price,
        produce_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        produce_province: req.body.produce_province,
      };
      try {
        models.FoodprintProducePrice.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New Produce and Price added successfully! Produce Name = ' +
                req.body.produce_name +
                ' and Produce Price = R' +
                req.body.produce_price
            );
            res.redirect('/app/produce/pricepage');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/produce/pricepage');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('pricepage', {
          page_title: 'FoodPrint - Price Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'pricepage',
        });
      }
    }
  }
);

//route for update data
router.post(
  '/pricepage/update',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_price', 'Your produce price is not valid').not().isEmpty().trim().escape(),
    check('produce_province', 'Your province is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('pricepage', {
        page_title: 'FoodPrint - Price Page',
        data: '',
        page_name: 'pricepage',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_price: 'R' + req.body.produce_price,
        produce_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        produce_province: req.body.produce_province,
      };
      try {
        models.FoodprintProducePrice.update(data, {
          where: {
            pk: req.body.pk,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Produce and Price updated successfully! Produce Name = ' +
                req.body.produce_name +
                ' and Produce Price = ' +
                req.body.produce_price
            );
            res.redirect('/app/produce/pricepage');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to produce page
            res.redirect('/app/produce/pricepage');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors:errors.array()});
        res.render('pricepage', {
          page_title: 'FoodPrint - Price Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'pricepage',
        });
      }
    }
  }
);

//route for delete data
router.post('/pricepage/delete', (req, res) => {
  models.FoodprintProducePrice.destroy({
    where: {
      pk: req.body.pk2,
    },
  })
    .then(_ => {
      req.flash(
        'success',
        'Produce and Price deleted successfully! Produce Name = ' +
          req.body.produce_name2 +
          ' and Produce Price = ' +
          req.body.produce_price2
      );
      res.redirect('/app/produce/pricepage');
    })
    .catch(err => {
      //throw err;
      req.flash('error', err);
      // redirect to Produce page
      res.redirect('/app/produce/pricepage');
    });
});

module.exports = router;
