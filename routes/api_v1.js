let express = require('express');
let router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
// let body = require('express-validator');
let moment = require('moment');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
let initModels = require('../models/init-models');
let sequelise = require('../config/db/db_sequelise');
const { Op } = require('sequelize');
let models = initModels(sequelise);
const { Sequelize } = require('sequelize');
var passport = require('passport');

/*
 *  HARVEST ROUTES
 */
router.get('/harvest', function (req, res) {
  try {
    models.FoodprintHarvest.findAll({
      order: [['pk', 'DESC']],
    })
      .then(rows => {
        if (rows.length === 0) {
          res.status(200).json([]);
        } else {
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].harvest_photoHash === null) {
              rows[i].harvest_photoHash = '';
            } else {
              rows[i].harvest_photoHash =
                'data:image/png;base64,' +
                Buffer.from(rows[i].harvest_photoHash, 'binary').toString('base64');
            }
          }
          res.status(200).json(rows);
        }
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

router.post(
  '/harvest/save',
  [
    check('harvest_supplierShortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_supplierName', 'Harvest Supplier Name is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_supplierAddress', 'Harvest Supplier Address value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_produceName', 'Harvest Produce Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    check('harvest_description', 'Harvest Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_geolocation', 'Harvest GeoLocation value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_quantity', 'Harvest Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
  ],
  async function (req, res) {
    const result = validationResult(req);
    let errors = result.errors;
    let error_message = '';
    for (let key in errors) {
      error_message = error_message + errors[key].msg + ', ';
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      res.status(400).json({
        message: error_message,
      });
    } else {
      let harvest_logid_uuid = uuidv4();
      let harvest_TimeStamp = moment(new Date(req.body.harvest_timestamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let harvest_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let harvest_photoHash = '';

      if (req.body.harvestURL) {
        try {
          const response = await fetch(req.body.harvestURL);
          harvest_photoHash = await response.buffer();
        } catch (e) {
          console.log(e);
        }
      }

      let data = {
        harvest_logid: harvest_logid_uuid,
        harvest_supplierShortcode: req.body.harvest_supplierShortcode,
        harvest_supplierName: req.body.harvest_supplierName,
        harvest_farmerName: req.body.harvest_farmerName,
        year_established: req.body.harvest_year_established,
        covid19_response: req.body.harvest_covid19_response,
        harvest_supplierAddress: req.body.harvest_supplierAddress,
        harvest_produceName: req.body.harvest_produceName,
        harvest_TimeStamp: harvest_TimeStamp,
        harvest_CaptureTime: harvest_CaptureTime,
        harvest_Description: req.body.harvest_description,
        harvest_geolocation: req.body.harvest_geolocation,
        harvest_quantity: req.body.harvest_quantity,
        harvest_unitOfMeasure: req.body.harvest_unitofmeasure,
        harvest_BlockchainHashID: '-',
        harvest_BlockchainHashData: '-',
        supplierproduce: req.body.supplierproduce,
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: req.body.email,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
        harvest_photoHash,
      };

      try {
        models.FoodprintHarvest.create(data)
          .then(_ => {
            res.status(201).json({
              message: 'Harvest created successfully',
              harvest_logid: data.harvest_logid,
            });
          })
          .catch(err => {
            res.status(400).json({
              message: err.message,
            });
          });
      } catch (e) {
        res.status(500).json({
          error: e,
          message: 'Internal Server Error',
        });
      }
    }
  }
);

router.post(
  '/harvest/update',
  [
    check('harvest_supplierShortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_supplierName', 'Harvest Supplier Name is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_supplierAddress', 'Harvest Supplier Address value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_produceName', 'Harvest Produce Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    check('harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
    check('harvest_description', 'Harvest Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_geolocation', 'Harvest GeoLocation value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_quantity', 'Harvest Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_blockchainhashid', 'Blockchain Hash ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    check('harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    check('logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    check('harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
  ],
  async function (req, res) {
    const result = validationResult(req);
    let errors = result.errors;
    let error_message = '';
    for (let key in errors) {
      error_message = error_message + errors[key].msg + ', ';
      console.log('Validation error - ' + errors[key].msg);
    }

    if (!result.isEmpty()) {
      res.status(400).json({
        message: error_message,
      });
    } else {
      console.log('req.body.harvest_logid ' + req.body.harvest_logid);
      let harvest_TimeStamp = moment(new Date(req.body.harvest_timestamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let harvest_CaptureTime = moment(new Date(req.body.harvest_capturetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let logdatetime = moment(new Date(req.body.logdatetime)).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date(req.body.lastmodifieddatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );

      let data = {
        harvest_supplierShortcode: req.body.harvest_supplierShortcode,
        harvest_supplierName: req.body.harvest_supplierName,
        harvest_farmerName: req.body.harvest_farmerName,
        harvest_supplierAddress: req.body.harvest_supplierAddress,
        year_established: req.body.harvest_year_established,
        covid19_response: req.body.harvest_covid19_response,
        harvest_produceName: req.body.harvest_produceName,
        harvest_TimeStamp: harvest_TimeStamp,
        harvest_CaptureTime: harvest_CaptureTime,
        harvest_Description: req.body.harvest_description,
        harvest_geolocation: req.body.harvest_geolocation,
        harvest_quantity: req.body.harvest_quantity,
        harvest_unitOfMeasure: req.body.harvest_unitofmeasure,
        harvest_BlockchainHashID: req.body.harvest_blockchainhashid,
        harvest_BlockchainHashData: req.body.harvest_blockchainhashdata,
        supplierproduce: req.body.supplierproduce,
        harvest_bool_added_to_blockchain: req.body.harvest_bool_added_to_blockchain,
        harvest_added_to_blockchain_by: req.body.harvest_added_to_blockchain_by,
        harvest_blockchain_uuid: req.body.harvest_blockchain_uuid,
        harvest_user: req.body.harvest_user,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };
      try {
        models.FoodprintHarvest.update(data, {
          where: {
            harvest_logid: req.body.harvest_logid,
          },
        })
          .then(_ => {
            res.status(200).json({
              message: 'Harvest entry updated successfully',
              harvest_logid: req.body.harvest_logid,
            });
          })
          .catch(err => {
            res.status(400).json({
              message: err.message,
            });
            console.log('Error - Update Harvest failed');
            console.log(err);
          });
      } catch (e) {
        res.status(500).json({
          error: e,
          message: 'Internal Server Error',
        });
      }
    }
  }
);

router.post(
  '/harvest/delete',
  [check('harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape()],
  function (req, res) {
    try {
      models.FoodprintHarvest.destroy({
        where: {
          harvest_logid: req.body.harvest_logid,
        },
      })
        .then(_ => {
          res.status(200).json({
            message: 'Harvest entry deleted successfully!',
            harvest_logid: req.body.harvest_logid,
          });
        })
        .catch(err => {
          res.status(400).json({
            message: err.message,
          });
        });
    } catch (e) {
      res.status(500).json({
        error: e,
        message: 'Internal Server Error',
      });
    }
  }
);

router.post('/harvest/save/whatsapp', async function (req, res) {
  let harvest_logid_uuid = uuidv4();
  let harvest_TimeStamp = moment(new Date(req.body.harvest_date)).format('YYYY-MM-DD');
  let harvest_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  let harvest_photoHash = '';

  if (req.body.harvestURL) {
    try {
      const response = await fetch(req.body.harvestURL);
      harvest_photoHash = await response.buffer();
    } catch (e) {
      console.log(e);
    }
  }

  let data = {
    harvest_logid: harvest_logid_uuid,
    harvest_farmerName: req.body.harvest_farmerName,
    harvest_produceName: req.body.harvest_produceName,
    harvest_TimeStamp: harvest_TimeStamp,
    harvest_CaptureTime: harvest_CaptureTime,
    harvest_quantity: req.body.harvest_quantity,
    harvest_unitOfMeasure: req.body.harvest_unitOfMeasure,
    harvest_BlockchainHashID: '-',
    harvest_BlockchainHashData: '-',
    harvest_bool_added_to_blockchain: 'false',
    harvest_added_to_blockchain_by: '-',
    harvest_blockchain_uuid: '-',
    harvest_user: req.body.email,
    logdatetime: logdatetime,
    lastmodifieddatetime: lastmodifieddatetime,
    harvest_photoHash,
  };
  try {
    models.FoodprintHarvest.create(data)
      .then(_ => {
        res.status(201).json({
          message: 'Harvest created successfully',
          harvest_logid: data.harvest_logid,
        });
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

router.get('/harvest/whatsapp', function (req, res, next) {
  try {
    models.FoodprintHarvest.findAll({
      attributes: [
        'harvest_produceName',
        'harvest_quantity',
        'harvest_unitOfMeasure',
        'logdatetime',
      ],
      where: {
        harvest_logid: req.body.harvest_logid,
      },
    })
      .then(rows => {
        res.status(200).json(rows);
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

/*
 *  STORAGE ROUTES
 */

router.get('/storage', function (req, res, next) {
  try {
    models.FoodprintStorage.findAll({
      order: [['pk', 'DESC']],
    })
      .then(rows => {
        res.status(200).json(rows);
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

router.post(
  '/storage/save',
  [
    check('harvest_supplierShortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('supplierproduce', ' Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_Shortcode', 'Market Shortcode value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_Name', 'Market Name value is not valid').not().isEmpty().trim().escape(),
    check('market_Address', 'Market Address value is not valid').not().isEmpty(),
    check('harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
    check('market_quantity', 'Storage Quantity value is not valid').not().isEmpty().trim().escape(),
    check('market_unitOfMeasure', 'Storage Unit of Measure value  is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_storageTimeStamp', 'Storage Timestamp value is not valid').not().isEmpty(),
    check('market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    check('storage_Description', 'Storage Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    let errors = result.errors;
    let error_message = '';
    for (let key in errors) {
      error_message = error_message + errors[key].msg + ', ';
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      res.status(400).json({
        message: error_message,
      });
    } else {
      let harvest_logid_uuid = req.body.harvest_logid;
      let storage_logid_uuid = uuidv4();
      let storage_TimeStamp = moment(new Date(req.body.market_storageTimeStamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let storage_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

      let req_harvest_supplierShortcode = req.body.harvest_supplierShortcode;
      let req_supplierproduce = req.body.supplierproduce;
      let req_market_Shortcode = req.body.market_Shortcode;
      let req_market_Name = req.body.market_Name;
      let req_market_Address = req.body.market_Address;
      let req_market_quantity = req.body.market_quantity;
      let req_market_unitOfMeasure = req.body.market_unitOfMeasure;
      let req_market_URL = req.body.market_URL;
      let req_storage_Description = req.body.storage_Description;
      let req_email = req.body.storage_user;

      //blockchain variables
      let sys_storage_BlockchainHashID = '-';
      let sys_storage_BlockchainHashData = '-';
      let sys_storage_bool_added_to_blockchain = 'false';
      let sys_storage_added_to_blockchain_by = '-';
      let sys_storage_blockchain_uuid = '-';

      let data = {
        harvest_logid: harvest_logid_uuid,
        storage_logid: storage_logid_uuid,
        harvest_supplierShortcode: req_harvest_supplierShortcode,
        supplierproduce: req_supplierproduce,
        market_Shortcode: req_market_Shortcode,
        market_Name: req_market_Name,
        market_Address: req_market_Address,
        market_quantity: req_market_quantity,
        market_unitOfMeasure: req_market_unitOfMeasure,
        market_storageTimeStamp: storage_TimeStamp,
        market_storageCaptureTime: storage_CaptureTime,
        market_URL: req_market_URL,
        storage_BlockchainHashID: sys_storage_BlockchainHashID,
        storage_BlockchainHashData: sys_storage_BlockchainHashData,
        storage_Description: req_storage_Description,
        storage_bool_added_to_blockchain: sys_storage_bool_added_to_blockchain,
        storage_added_to_blockchain_by: sys_storage_added_to_blockchain_by,
        storage_blockchain_uuid: sys_storage_blockchain_uuid,
        storage_user: req_email,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };

      try {
        models.FoodprintStorage.create(data)
          .then(_ => {
            models.FoodprintHarvest.findAll({
              where: {
                harvest_logid: harvest_logid_uuid,
              },
            })
              .then(harvest_rows => {
                let logid_uuid = uuidv4();
                let weeklyViewData = {
                  logid: logid_uuid,
                  harvest_logid: harvest_logid_uuid,
                  harvest_supplierShortcode: req_harvest_supplierShortcode,
                  harvest_supplierName: harvest_rows[0].harvest_supplierName,
                  harvest_farmerName: harvest_rows[0].harvest_farmerName,
                  harvest_supplierAddress: harvest_rows[0].harvest_supplierAddress,
                  year_established: harvest_rows[0].year_established,
                  covid19_response: harvest_rows[0].covid19_response,
                  harvest_produceName: harvest_rows[0].harvest_produceName,
                  harvest_photoHash: harvest_rows[0].harvest_photoHash,
                  harvest_TimeStamp: harvest_rows[0].harvest_TimeStamp,
                  harvest_CaptureTime: harvest_rows[0].harvest_CaptureTime,
                  harvest_Description: harvest_rows[0].harvest_Description,
                  harvest_geolocation: harvest_rows[0].harvest_geolocation,
                  harvest_quantity: harvest_rows[0].harvest_quantity,
                  harvest_unitOfMeasure: harvest_rows[0].harvest_unitOfMeasure,
                  harvest_description_json: harvest_rows[0].harvest_description_json,
                  harvest_BlockchainHashID: harvest_rows[0].harvest_BlockchainHashID,
                  harvest_BlockchainHashData: harvest_rows[0].harvest_BlockchainHashData,
                  supplierproduce: req_supplierproduce,
                  storage_logid: storage_logid_uuid,
                  market_Address: req_market_Address,
                  market_quantity: req_market_quantity,
                  market_unitOfMeasure: req_market_unitOfMeasure,
                  market_storageTimeStamp: storage_TimeStamp,
                  market_storageCaptureTime: storage_CaptureTime,
                  market_URL: req_market_URL,
                  storage_BlockchainHashID: sys_storage_BlockchainHashID,
                  storage_BlockchainHashData: sys_storage_BlockchainHashData,
                  storage_Description: req_storage_Description,
                  storage_bool_added_to_blockchain: sys_storage_bool_added_to_blockchain,
                  storage_added_to_blockchain_by: sys_storage_added_to_blockchain_by,
                  storage_blockchain_uuid: sys_storage_blockchain_uuid,
                  harvest_bool_added_to_blockchain:
                    harvest_rows[0].harvest_bool_added_to_blockchain,
                  harvest_added_to_blockchain_date:
                    harvest_rows[0].harvest_added_to_blockchain_date,
                  harvest_added_to_blockchain_by: harvest_rows[0].harvest_added_to_blockchain_by,
                  harvest_blockchain_uuid: harvest_rows[0].harvest_blockchain_uuid,
                  harvest_user: harvest_rows[0].harvest_user,
                  storage_user: req_email,
                  logdatetime: logdatetime,
                  lastmodifieddatetime: lastmodifieddatetime,
                };

                models.FoodprintWeeklyview.create(weeklyViewData)
                  .then(_ => {
                    // console.log('Add weekly view successful');
                  })
                  .catch(err => {
                    console.error('Add weekly view error occured');
                    console.error('error', err);
                  });
              })
              .catch(err => {
                console.error('err pulling harvest_row - ' + err);
              });

            res.status(201).json({
              message: 'New Storage entry added successfully',
              storage_logid: storage_logid_uuid,
            });
          })
          .catch(err => {
            res.status(400).json({
              message: err.message,
            });
          });
      } catch (e) {
        res.status(500).json({
          error: e,
          message: 'Internal Server Error',
        });
      }
    }
  }
);

//route for update data
router.post(
  '/storage/update',
  [
    check('harvest_supplierShortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('supplierproduce', ' Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_Shortcode', 'Market Shortcode value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_Name', 'Market Name value is not valid').not().isEmpty().trim().escape(),
    check('market_Address', 'Market Address value is not valid').not().isEmpty(),
    check('market_quantity', 'Storage Quantity value is not valid').not().isEmpty().trim().escape(),
    check('market_unitOfMeasure', 'Storage Unit of Measure value  is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('market_storageTimeStamp', 'Storage Timestamp value is not valid').not().isEmpty(),
    check('market_storageCaptureTime', 'Storage Capture Time is not valid').not().isEmpty(),
    check('market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    check('storage_BlockchainHashID', 'Blockchain Hash ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_BlockchainHashData', 'Blockchain Hash Data value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_Description', 'Storage Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_bool_added_to_blockchain', 'Added to Blockchain value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_added_to_blockchain_by', 'Storage Added to Blockchain by is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_blockchain_uuid', 'Storage Blockchain UUID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('storage_user', 'Sorage User  value is not valid').not().isEmpty().trim().escape(),
    check('logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('lastmodifieddatetime', 'Last Modified Datetime value is not valid').not(),
    check('harvest_logid', 'Harvest ID value is not valid').not().isEmpty().escape(),
    check('storage_logid', 'Storage ID value is not valid').not().isEmpty().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    let errors = result.errors;
    let error_message = '';
    for (let key in errors) {
      error_message = error_message + errors[key].msg + ', ';
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      res.status(400).json({
        message: error_message,
      });
    } else {
      // console.log('req.body.harvest_logid ' + req.body.harvest_logid);
      let storage_TimeStamp = moment(new Date(req.body.market_storageTimeStamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let storage_CaptureTime = moment(new Date(req.body.market_storageCaptureTime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let logdatetime = moment(new Date(req.body.logdatetime)).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date(req.body.lastmodifieddatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );

      let data = {
        harvest_logid: req.body.harvest_logid,
        harvest_supplierShortcode: req.body.harvest_supplierShortcode,
        supplierproduce: req.body.supplierproduce,
        market_Shortcode: req.body.market_Shortcode,
        market_Name: req.body.market_Name,
        market_Address: req.body.market_Address,
        market_quantity: req.body.market_quantity,
        market_unitOfMeasure: req.body.market_unitOfMeasure,
        market_storageTimeStamp: storage_TimeStamp,
        market_storageCaptureTime: storage_CaptureTime,
        market_URL: req.body.market_URL,
        storage_BlockchainHashID: req.body.storage_BlockchainHashID,
        storage_BlockchainHashData: req.body.storage_BlockchainHashData,
        storage_Description: req.body.storage_Description,
        storage_bool_added_to_blockchain: req.body.storage_bool_added_to_blockchain,
        storage_added_to_blockchain_by: req.body.storage_added_to_blockchain_by,
        storage_blockchain_uuid: req.body.storage_blockchain_uuid,
        storage_user: req.body.storage_user,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };
      try {
        models.FoodprintStorage.update(data, {
          where: {
            storage_logid: req.body.storage_logid,
          },
        })
          .then(_ => {
            res.status(200).json({
              message: 'Storage entry updated successfully',
              storage_logid: req.body.storage_logid,
            });
          })
          .catch(err => {
            res.status(400).json({
              message: err.message,
            });
          });
      } catch (e) {
        res.status(500).json({
          error: e,
          message: 'Internal Server Error',
        });
      }
    }
  }
);

router.post(
  '/storage/delete',
  [check('storage_logid', 'Storage ID value is not valid').not().isEmpty().trim().escape()],
  function (req, res) {
    try {
      models.FoodprintStorage.destroy({
        where: {
          storage_logid: req.body.storage_logid,
        },
      })
        .then(_ => {
          res.status(200).json({
            message: 'Storage entry deleted successfully',
            storage_logid: req.body.storage_logid,
          });
        })
        .catch(err => {
          res.status(400).json({
            message: err.message,
          });
        });
    } catch (e) {
      res.status(500).json({
        error: e,
        message: 'Internal Server Error',
      });
    }
  }
);

router.post('/storage/save/whatsapp', function (req, res) {
  let storage_logid_uuid = uuidv4();
  let storage_TimeStamp = moment(new Date(req.body.storage_date)).format('YYYY-MM-DD');
  let storage_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  let req_harvest_suppliershortcode = req.body.harvest_supplierShortcode;
  let req_supplierproduce = req.body.supplierproduce;
  let req_market_quantity = req.body.market_quantity;
  let req_market_unitOfMeasure = req.body.market_unitOfMeasure;
  let req_email = req.body.email;

  let sys_storage_BlockchainHashID = '-';
  let sys_storage_BlockchainHashData = '-';
  let sys_storage_bool_added_to_blockchain = 'false';
  let sys_storage_added_to_blockchain_by = '-';
  let sys_storage_blockchain_uuid = '-';

  let data = {
    storage_logid: storage_logid_uuid,
    harvest_supplierShortcode: req_harvest_suppliershortcode,
    supplierproduce: req_supplierproduce,
    market_quantity: req_market_quantity,
    market_unitOfMeasure: req_market_unitOfMeasure,
    market_storageTimeStamp: storage_TimeStamp,
    market_storageCaptureTime: storage_CaptureTime,
    storage_BlockchainHashID: sys_storage_BlockchainHashID,
    storage_BlockchainHashData: sys_storage_BlockchainHashData,
    storage_bool_added_to_blockchain: sys_storage_bool_added_to_blockchain,
    storage_added_to_blockchain_by: sys_storage_added_to_blockchain_by,
    storage_blockchain_uuid: sys_storage_blockchain_uuid,
    storage_user: req_email,
    logdatetime: logdatetime,
    lastmodifieddatetime: lastmodifieddatetime,
  };

  try {
    models.FoodprintStorage.create(data)
      .then(_ => {
        res.status(201).json({
          message: 'Storage entry created successfully',
          storage_logid: data.storage_logid,
        });
      })
      .catch(err => {
        res.status(400).json({
          error: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

router.get('/storage/whatsapp', function (req, res, next) {
  try {
    models.FoodprintStorage.findAll({
      attributes: ['supplierproduce', 'market_quantity', 'market_unitOfMeasure', 'logdatetime'],
      where: {
        storage_logid: req.body.storage_logid,
      },
    })
      .then(rows => {
        res.status(200).json(rows);
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

/*
 * QR COUNT
 */
router.get('/qrcount/scans/:startDate', function (req, res) {
  const { startDate } = req.params;
  try {
    models.FoodprintQrcount.findAll({
      attributes: ['qrid', [Sequelize.fn('COUNT', '*'), 'scanCount']],
      group: ['qrid'],
      raw: true,
      where: {
        logdatetime: {
          [Op.gte]: moment(new Date(startDate)).format('YYYY-MM-DD'),
        },
      },
    })
      .then(rows => {
        let response = [];
        rows.forEach(row => {
          response.push(`${row.qrid} - ${row.scanCount} scans`);
        });
        res.status(200).json(response);
      })
      .catch(err => {
        res.status(400).json({
          message: err.message,
        });
      });
  } catch (e) {
    res.status(500).json({
      error: e,
      message: 'Internal Server Error',
    });
  }
});

/*
 * AUTHENTICATION
 */
router.post('/login', passport.authenticate('file-local', { session: false }), function (req, res) {
  res.status(200).json({ message: 'Login Successful' });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.status(200).json({ message: 'You are now logged out' });
});

module.exports = router;
