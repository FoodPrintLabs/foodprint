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

var models = initModels(sequelise);

router.get(
  '/admin',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          for (let i = 0; i < rows.length; i++) {
            rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          res.render('dashboard_admin', {
            title: 'FoodPrint - Admin Dashboard',
            data: rows,
            user: req.user,
            page_name: 'Dashboard',
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
      //   connection.execute('SELECT * FROM foodprint_harvest ORDER BY pk desc',function(err,rows)     {
      //       if(err){
      //            req.flash('error', err);
      //            res.render('harvestlogbook',{  page_title:"FoodPrint - Harvest Logbook",
      //                                   data:'', user: req.user, page_name:'harvestlogbook' });
      //       }else{
      //           for (i=0; i<rows.length; i++)
      //           {
      //               rows[i].harvest_photoHash = 'data:image/png;base64,' +
      //                   new Buffer(rows[i].harvest_photoHash, 'binary').toString('base64');
      //           }
      //           res.render('harvestlogbook',{   page_title:"FoodPrint - Harvest Logbook",
      //                                   data:rows, user: req.user,
      //                                   page_name:'harvestlogbook' });
      //       }
      //    });
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

router.get(
  '/farmer',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Farmer) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          for (let i = 0; i < rows.length; i++) {
            rows[i].harvest_photoHash =
              'data:image/png;base64,' +
              new Buffer(rows[i].harvest_photoHash, 'binary').toString('base64');
          }
          res.render('dashboard_farmer', {
            title: 'FoodPrint - Farmer Dashboard',
            data: rows,
            user: req.user,
            page_name: 'Dashboard',
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
      //   connection.execute('SELECT * FROM foodprint_harvest ORDER BY pk desc',function(err,rows)     {
      //       if(err){
      //            req.flash('error', err);
      //            res.render('harvestlogbook',{  page_title:"FoodPrint - Harvest Logbook",
      //                                   data:'', user: req.user, page_name:'harvestlogbook' });
      //       }else{
      //           for (i=0; i<rows.length; i++)
      //           {
      //               rows[i].harvest_photoHash = 'data:image/png;base64,' +
      //                   new Buffer(rows[i].harvest_photoHash, 'binary').toString('base64');
      //           }
      //           res.render('harvestlogbook',{   page_title:"FoodPrint - Harvest Logbook",
      //                                   data:rows, user: req.user,
      //                                   page_name:'harvestlogbook' });
      //       }
      //    });
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

/*Render admin dashboard 
router.get('/admin', function (req, res) {
  res.render('dashboard_admin', {
    title: 'FoodPrint - Admin Dashboard',
    user: req.user,
    page_name: 'Dashboard',
  });
});

/*Render farmer dashboard 
router.get('/farmer', function (req, res) {
  res.render('dashboard_farmer', {
    title: 'FoodPrint - Farmer Dashboard',
    user: req.user,
    page_name: 'Dashboard',
  });
});
*/

//TODO
//GET ALL CROPS HARVESTED

//GET TOTAL AMOUNT FOR EACH CROP (PASS PARAMETER)

//GET TOTAL AMOUNT FOR EACH FARMER (PASS PARAMETERS)

module.exports = router;
