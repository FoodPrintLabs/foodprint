var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
var body = require('express-validator'); //validation
var moment = require('moment'); //datetime
var ROLES = require('../utils/roles');
var QRCode = require('qrcode');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const env = process.env.NODE_ENV || 'development';
const CUSTOM_ENUMS = require('../utils/enums');
var models = initModels(sequelise);

const {
  getUploadParams,
  resolveFilenames,
  uploadConnection,
} = require('../config/digitalocean/file-upload');
const pdfService = require('../config/pdf/pdf-service');
const { storagepdf } = require('../config/pdf/storagepdf');
//Name of your DO bucket here
const BucketName = process.env.DO_BUCKET_NAME;

/*   function to determine rows of data that can be seen based on user role */
function getStorageSqlSearchCondition(user) {
  // default permission is to see only rows the user has added
  let sql_search_condition = {
    where: {
      storage_user: user.email,
    },
    order: [['pk', 'DESC']],
  };

  // admins and superusers can see all records
  if (user.role === ROLES.Admin || user.role === ROLES.Superuser) {
    sql_search_condition = {
      order: [['pk', 'DESC']],
    };
  }
  return sql_search_condition;
}

/* GET storage page. */
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (
      req.user.role === ROLES.Farmer ||
      req.user.role === ROLES.Admin ||
      req.user.role === ROLES.Superuser
    ) {
      // admins and superusers can see all records, whilst farmers can see only records they added
      const sql_search_condition = getStorageSqlSearchCondition(req.user);

      models.FoodprintStorage.findAll(sql_search_condition)
        .then(async rows => {
          console.log('All storage rows:' + rows.length.toString());
          models.FoodprintHarvest.findAll({
            attributes: [
              'harvest_logid',
              'supplierproduce',
              'harvest_quantity',
              'harvest_unitOfMeasure',
              'harvest_TimeStamp',
            ],
            order: [['pk', 'DESC']],
          })
            .then(async harvest_rows => {
              console.log('All harvests:' + harvest_rows.length.toString());
              //create array of URL data (cannot have black qrcode_url)
              console.log('Generating QR Codes');
              const qrcodes = [];
              for (var i = 0; i < rows.length; i++) {
                if (rows[i].qrcode_url) {
                  var qrcode_image = await QRCode.toDataURL(rows[i].qrcode_url);
                  qrcodes.push(qrcode_image);
                } else {
                  //Create QR Code Link to generate QR code
                  //check environment product was saved in for URL
                  let host = req.get('host');
                  let protocol = 'https';
                  // if running in dev then protocol can be http
                  if (process.env.NODE_ENV === CUSTOM_ENUMS.DEVELOPMENT) {
                    protocol = req.protocol;
                  }
                  let final_qrcode_url =
                    protocol + '://' + host + '/app/scan/' + rows[i].supplierproduce;

                  var qrcode_image = await QRCode.toDataURL(final_qrcode_url);
                  qrcodes.push(qrcode_image);
                  models.FoodprintStorage.update(
                    { qrcode_url: final_qrcode_url },
                    {
                      where: { storage_logid: rows[i].storage_logid },
                    }
                  );
                }
              }
              console.log('Successful QRCode Generation');
              res.render('storagelogbook', {
                page_title: 'FoodPrint - Storage Logbook',
                data: rows,
                harvest_data: harvest_rows,
                user: req.user,
                qrcodes: qrcodes,
                page_name: 'storagelogbook',
              });
            })
            .catch(err => {
              console.log('All storage err:' + err);
              req.flash('error', err.message);
              // redirect to Storage Logbook page
              res.redirect('/app/storage');
            });
        })
        .catch(err => {
          req.flash('error', err.message);
          // redirect to Storage Logbook page
          res.redirect('/app/storage');
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        qrcodes: '',
        page_name: 'error',
      });
    }
  }
);

//route for insert data
router.post(
  '/save',
  [
    //System populated items commented out and excluded from validation
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_supplierproduce', ' Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Shortcode', 'Market Shortcode value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Name', 'Market Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Address', 'Market Address value is not valid').not().isEmpty(),
    check('viewmodal_harvest_logidSelect', 'Harvest ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_quantity', 'Storage Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_unitOfMeasure', 'Storage Unit of Measure value  is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_storageTimeStamp', 'Storage Timestamp value is not valid')
      .not()
      .isEmpty(),
    //check('viewmodal_market_storageCaptureTime', 'Storage Capture Time is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_storage_BlockchainHashID', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_storage_BlockchainHashData', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_Description', 'Storage Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check('viewmodal_storage_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_storage_added_to_blockchain_date', Storage Added to Blockchain Date is not valid').not().isEmpty(),
    // check('viewmodal_storage_added_to_blockchain_by', 'Storage Added to Blockchain by is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_storage_blockchain_uuid', 'Storage Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_storage_user', 'Sorage User  value is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    // check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not(),
    // check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().escape(),
    // check('viewmodal_storage_logid', 'Storage ID value is not valid').not().isEmpty().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.redirect('/app/storage');
    } else {
      //console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
      console.log(
        'req.body.viewmodal_harvest_logidSelect ' + req.body.viewmodal_harvest_logidSelect
      );

      let harvest_logid_uuid = req.body.viewmodal_harvest_logidSelect;
      let storage_logid_uuid = uuidv4();
      let storage_TimeStamp = moment(new Date(req.body.viewmodal_market_storageTimeStamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      ); //actual time of storage/handover at market with farmer
      let storage_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //time of storage/handover data entry
      let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

      //access req.body variables
      let req_harvest_suppliershortcode = req.body.viewmodal_harvest_suppliershortcode;
      let req_supplierproduce = req.body.viewmodal_supplierproduce;
      let req_market_Shortcode = req.body.viewmodal_market_Shortcode;
      let req_market_Name = req.body.viewmodal_market_Name;
      let req_market_Address = req.body.viewmodal_market_Address;
      let req_market_quantity = req.body.viewmodal_market_quantity;
      let req_market_unitOfMeasure = req.body.viewmodal_market_unitOfMeasure;
      let req_market_URL = req.body.viewmodal_market_URL;
      let req_storage_Description = req.body.viewmodal_storage_Description;
      let req_email = req.user.email;

      //blockchain variables
      let sys_storage_BlockchainHashID = '-';
      let sys_storage_BlockchainHashData = '-';
      let sys_storage_bool_added_to_blockchain = 'false';
      let sys_storage_added_to_blockchain_by = '-';
      let sys_storage_blockchain_uuid = '-';

      //Create and store QR Code Link
      //check environment product was saved in for URL
      let host = req.get('host');
      let protocol = 'https';
      // if running in dev then protocol can be http
      if (process.env.NODE_ENV === CUSTOM_ENUMS.DEVELOPMENT) {
        protocol = req.protocol;
      }
      let final_qrcode_url = protocol + '://' + host + '/app/scan/' + req_supplierproduce;

      let data = {
        harvest_logid: harvest_logid_uuid,
        storage_logid: storage_logid_uuid,
        harvest_supplierShortcode: req_harvest_suppliershortcode,
        supplierproduce: req_supplierproduce, // e.g. WMPN_BabyMarrow
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
        storage_bool_added_to_blockchain: sys_storage_bool_added_to_blockchain, //true or false
        //storage_added_to_blockchain_date: NULL,  //system generated when add to blockchain is selected
        storage_added_to_blockchain_by: sys_storage_added_to_blockchain_by, // user who logged storage to blockchain
        storage_blockchain_uuid: sys_storage_blockchain_uuid, // uuid to blockchain config record which has contract and address
        storage_user: req_email, // user who logged storage
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
        qrcode_url: final_qrcode_url,
      };
      console.log('storage_TimeStamp - ' + storage_TimeStamp);
      console.log(
        'viewmodal_market_storageTimeStamp - ' + req.body.viewmodal_market_storageTimeStamp
      );

      try {
        models.FoodprintStorage.create(data)
          .then(_ => {
            console.log('Add storage entry successful');
            models.FoodprintHarvest.findAll({
              where: {
                harvest_logid: harvest_logid_uuid,
              },
            })
              .then(harvest_rows => {
                console.log('success getting harvest_row - ' + harvest_rows);
                console.log(
                  'harvest_rows[0].harvest_supplierName - ' + harvest_rows[0].harvest_supplierName
                );
                let logid_uuid = uuidv4();

                let weeklyViewData = {
                  logid: logid_uuid,
                  harvest_logid: harvest_logid_uuid,
                  harvest_supplierShortcode: req_harvest_suppliershortcode,
                  harvest_supplierName: harvest_rows[0].harvest_supplierName,
                  harvest_farmerName: harvest_rows[0].harvest_farmerName,
                  harvest_supplierAddress: harvest_rows[0].harvest_supplierAddress,
                  year_established: harvest_rows[0].year_established,
                  covid19_response: harvest_rows[0].covid19_response,
                  harvest_produceName: harvest_rows[0].harvest_produceName,
                  harvest_photoHash: harvest_rows[0].harvest_photoHash,
                  harvest_image_url: harvest_rows[0].harvest_image_url,
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
                    `${harvest_rows[0].harvest_added_to_blockchain_date}`,
                  harvest_added_to_blockchain_by: harvest_rows[0].harvest_added_to_blockchain_by,
                  harvest_blockchain_uuid: harvest_rows[0].harvest_blockchain_uuid,
                  harvest_user: harvest_rows[0].harvest_user,
                  storage_user: req_email,
                  logdatetime: logdatetime,
                  lastmodifieddatetime: lastmodifieddatetime,
                };

                models.FoodprintWeeklyview.create(weeklyViewData)
                  .then(_ => {
                    console.log('Add weekly view successful');
                  })
                  .catch(err => {
                    console.error('Add weekly view error occured');
                    console.error('error', err);
                  });
              })
              .catch(err => {
                console.error('err pulling harvest_row - ' + err);
              });

            req.flash(
              'success',
              'New Storage entry added successfully! Storage ID = ' + storage_logid_uuid
            );
            res.redirect('/app/storage');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err.message);
            // redirect to Storage Logbook page
            res.redirect('/app/storage');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors:errors.array()});
        console.log('Error - error handling middleware');

        if (
          req.user.role === ROLES.Farmer ||
          req.user.role === ROLES.Admin ||
          req.user.role === ROLES.Superuser
        ) {
          // admins and superusers can see all records, whilst farmers can see only records they added
          const sql_search_condition = getStorageSqlSearchCondition(req.user);

          models.FoodprintStorage.findAll(sql_search_condition)
            .then(_ => {
              res.render('storagelogbook', {
                page_title: 'FoodPrint - Storage Logbook',
                success: false,
                errors: e.array(),
                data: rows,
                user: req.user,
                page_name: 'storagelogbook',
              });
            })
            .catch(err => {
              console.log('All storage err:' + err);
              req.flash('error', err.message);
              // redirect to Storage Logbook page
              res.redirect('/app/storage');
            });
        }
      }
    }
  }
);

// create a storage harvest via WhatsApp
router.post('/save/whatsapp', function (req, res) {
  // let harvest_logid_uuid = req.body.viewmodal_harvest_logidSelect
  let storage_logid_uuid = uuidv4();
  let storage_TimeStamp = moment(new Date(req.body.storage_date)).format('YYYY-MM-DD'); //actual time of storage/handover at market with farmer
  let storage_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //time of storage/handover data entry
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  //access req.body variables
  let req_harvest_suppliershortcode = req.body.harvest_supplierShortcode;
  let req_supplierproduce = req.body.supplierproduce;
  let req_market_quantity = req.body.market_quantity;
  let req_market_unitOfMeasure = req.body.market_unitOfMeasure;
  let req_email = req.body.email;

  //blockchain variables
  let sys_storage_BlockchainHashID = '-';
  let sys_storage_BlockchainHashData = '-';
  let sys_storage_bool_added_to_blockchain = 'false';
  let sys_storage_added_to_blockchain_by = '-';
  let sys_storage_blockchain_uuid = '-';

  //Create and store QR Code Link
  //check environment product was saved in for URL
  let host = req.get('host');
  let protocol = 'https';
  // if running in dev then protocol can be http
  if (process.env.NODE_ENV === CUSTOM_ENUMS.DEVELOPMENT) {
    protocol = req.protocol;
  }
  let final_qrcode_url = protocol + '://' + host + '/app/scan/' + req_supplierproduce;

  let data = {
    // harvest_logid: harvest_logid_uuid,
    storage_logid: storage_logid_uuid,
    harvest_supplierShortcode: req_harvest_suppliershortcode,
    supplierproduce: req_supplierproduce, // e.g. WMPN_BabyMarrow
    market_quantity: req_market_quantity,
    market_unitOfMeasure: req_market_unitOfMeasure,
    market_storageTimeStamp: storage_TimeStamp,
    market_storageCaptureTime: storage_CaptureTime,
    storage_BlockchainHashID: sys_storage_BlockchainHashID,
    storage_BlockchainHashData: sys_storage_BlockchainHashData,
    storage_bool_added_to_blockchain: sys_storage_bool_added_to_blockchain, //true or false
    storage_added_to_blockchain_by: sys_storage_added_to_blockchain_by, // user who logged storage to blockchain
    storage_blockchain_uuid: sys_storage_blockchain_uuid, // uuid to blockchain config record which has contract and address
    storage_user: req_email, // user who logged storage
    logdatetime: logdatetime,
    lastmodifieddatetime: lastmodifieddatetime,
    qrcode_url: final_qrcode_url,
  };

  try {
    models.FoodprintStorage.create(data)
      .then(_ => {
        console.log('Add storage entry successful');
        res.status(201).send({ message: 'storage created', storage_logid: data.storage_logid });
      })
      .catch(err => {
        //throw err;
        res.status(400).send({ error: err.message });
      });
  } catch (e) {
    console.log('Error occurred', e);
    res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
  }
});

//route for update data
router.post(
  '/update',
  [
    //System populated items commented out and excluded from validation
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_supplierproduce', ' Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Shortcode', 'Market Shortcode value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Name', 'Market Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_Address', 'Market Address value is not valid').not().isEmpty(),
    check('viewmodal_market_quantity', 'Storage Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_unitOfMeasure', 'Storage Unit of Measure value  is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_market_storageTimeStamp', 'Storage Timestamp value is not valid')
      .not()
      .isEmpty(),
    check('viewmodal_market_storageCaptureTime', 'Storage Capture Time is not valid')
      .not()
      .isEmpty(),
    check('viewmodal_market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_BlockchainHashID', 'Blockchain Hash ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_storage_BlockchainHashData', 'Blockchain Hash Data value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_storage_Description', 'Storage Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_storage_bool_added_to_blockchain', 'Added to Blockchain value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    //check('viewmodal_storage_added_to_blockchain_date', 'Storage Added to Blockchain Date is not valid').not().isEmpty(),
    check('viewmodal_storage_added_to_blockchain_by', 'Storage Added to Blockchain by is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_storage_blockchain_uuid', 'Storage Blockchain UUID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_storage_user', 'Sorage User  value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not(),
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().escape(),
    check('viewmodal_storage_logid', 'Storage ID value is not valid').not().isEmpty().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      //console.log('Error - !result.isEmpty');
      //console.log(errors);
      req.flash('error', errors);
      res.redirect('/app/storage');
    } else {
      console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
      let storage_TimeStamp = moment(new Date(req.body.viewmodal_market_storageTimeStamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let storage_CaptureTime = moment(
        new Date(req.body.viewmodal_market_storageCaptureTime)
      ).format('YYYY-MM-DD HH:mm:ss');
      let logdatetime = moment(new Date(req.body.viewmodal_logdatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let lastmodifieddatetime = moment(new Date(req.body.viewmodal_lastmodifieddatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );

      let data = {
        harvest_logid: req.body.viewmodal_harvest_logid,
        harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
        supplierproduce: req.body.viewmodal_supplierproduce,
        market_Shortcode: req.body.viewmodal_market_Shortcode,
        market_Name: req.body.viewmodal_market_Name,
        market_Address: req.body.viewmodal_market_Address,
        market_quantity: req.body.viewmodal_market_quantity,
        market_unitOfMeasure: req.body.viewmodal_market_unitOfMeasure,
        market_storageTimeStamp: storage_TimeStamp,
        market_storageCaptureTime: storage_CaptureTime,
        market_URL: req.body.viewmodal_market_URL,
        storage_BlockchainHashID: req.body.viewmodal_storage_BlockchainHashID,
        storage_BlockchainHashData: req.body.viewmodal_storage_BlockchainHashData,
        storage_Description: req.body.viewmodal_storage_Description,
        storage_bool_added_to_blockchain: req.body.viewmodal_storage_bool_added_to_blockchain,
        //  storage_added_to_blockchain_date: req.body.viewmodal_storage_added_to_blockchain_date,
        storage_added_to_blockchain_by: req.body.viewmodal_storage_added_to_blockchain_by,
        storage_blockchain_uuid: req.body.viewmodal_storage_blockchain_uuid,
        storage_user: req.body.viewmodal_storage_user,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };
      try {
        models.FoodprintStorage.update(data, {
          where: {
            storage_logid: req.body.viewmodal_storage_logid,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Storage entry updated successfully! Storage ID = ' + req.body.viewmodal_storage_logid
            );
            res.redirect('/app/storage');
          })
          .catch(err => {
            //throw err;
            console.log('Error - Update Harvest failed');
            console.log(err);
            req.flash('error', err.message);
            // redirect to Storage Logbook page
            res.redirect('/app/storage');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors:errors.array()});
        console.log('Error - error handling middleware');

        if (
          req.user.role === ROLES.Farmer ||
          req.user.role === ROLES.Admin ||
          req.user.role === ROLES.Superuser
        ) {
          // admins and superusers can see all records, whilst farmers can see only records they added
          const sql_search_condition = getStorageSqlSearchCondition(req.user);

          models.FoodprintStorage.findAll(sql_search_condition)
            .then(_ => {
              res.render('storagelogbook', {
                page_title: 'FoodPrint - Storage Logbook',
                success: false,
                errors: e.array(),
                data: rows,
                user: req.user,
                page_name: 'storagelogbook',
              });
            })
            .catch(err => {
              req.flash('error', err.message);
              // redirect to Storage Logbook page
              res.redirect('/app/storage');
            });
        }
      }
    }
  }
);

//route for delete data
//TODO - should we add a deleted field and rather set that to 1 instead of an actual delete?
router.post(
  '/delete',
  [
    check('viewmodal_storage_logid', 'Storage ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  function (req, res) {
    console.log('configid ' + req.body.viewmodal_storage_logid);
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintStorage.destroy({
        where: {
          storage_logid: req.body.viewmodal_storage_logid,
        },
      })
        .then(_ => {
          req.flash(
            'success',
            'Storage entry deleted successfully! Storage ID = ' + req.body.viewmodal_storage_logid
          );
          res.redirect('/app/storage');
        })
        .catch(err => {
          //throw err;
          req.flash('error', err.message);
          // redirect to Storage Logbook page
          res.redirect('/app/storage');
        });
    } else {
      req.flash('error', 'You are not authorised to delete Storage records.');
      res.redirect('/app/storage');
    }
  }
);

/* GET PDF of all Storage entries (as an admin) - webapp */
router.get(
  '/pdf/all',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res) {
    models.FoodprintStorage.findAll({
      attributes: [
        'harvest_logid',
        'storage_logid',
        'harvest_supplierShortcode',
        'supplierproduce',
        'market_Name',
        'market_quantity',
        'market_unitOfMeasure',
        'market_storageTimeStamp',
        'blockchain_explorer_url',
      ],
      order: [['pk', 'DESC']],
    })
      .then(rows => {
        const pdffileextension = '.pdf';
        const username = req.user.username;
        const useremail = req.user.email;
        const pdfFilename = `FoodPrint_Storage_${username}_${moment(new Date()).format(
          'YYYY-MM-DD'
        )}`;
        const filenames = resolveFilenames(pdfFilename, pdffileextension);

        const stream = res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename=' + filenames.filename,
        });
        pdfService.buildPDF(
          `MASTER STORAGE ENTRIES GENERATED BY ADMIN ${username} ${useremail}
                ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
          storagepdf(rows),
          chunk => stream.write(chunk),
          () => stream.end()
        );
      })
      .catch(err => {
        console.log('Storage PDF err:' + err);
        req.flash('error', err);
      });
  }
);

/* GET PDF of Storage record for farmer - webapp */
router.get(
  '/pdf',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res) {
    models.FoodprintStorage.findAll({
      attributes: [
        'harvest_logid',
        'storage_logid',
        'harvest_supplierShortcode',
        'supplierproduce',
        'market_Name',
        'market_quantity',
        'market_unitOfMeasure',
        'market_storageTimeStamp',
        'blockchain_explorer_url',
      ],
      order: [['pk', 'DESC']],
      where: {
        storage_user: req.user.email,
      },
    })
      .then(rows => {
        const pdffileextension = '.pdf';
        const username = req.user.username;
        const useremail = req.user.email;
        const pdfFilename = `FoodPrint_Storage_${username}_${moment(new Date()).format(
          'YYYY-MM-DD'
        )}`;
        const filenames = resolveFilenames(pdfFilename, pdffileextension);

        const stream = res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename=' + filenames.filename,
        });
        pdfService.buildPDF(
          `STORAGE ENTRIES FOR ${username} ${useremail}
                ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
          storagepdf(rows),
          chunk => stream.write(chunk),
          () => stream.end()
        );
      })
      .catch(err => {
        console.log('Storage PDF err:' + err);
        req.flash('error', err);
      });
  }
);

/* GET PDF of Storage record for farmer - whatsapp */
router.get('/pdf/whatsapp/:phoneNumber', function (req, res) {
  try {
    const { phoneNumber } = req.params;
    models.User.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    })
      .then(user => {
        const emailAddress = user.email;
        models.FoodprintStorage.findAll({
          attributes: [
            'harvest_logid',
            'storage_logid',
            'harvest_supplierShortcode',
            'supplierproduce',
            'market_Name',
            'market_quantity',
            'market_unitOfMeasure',
            'market_storageTimeStamp',
            'blockchain_explorer_url',
          ],
          order: [['pk', 'DESC']],
          where: {
            storage_user: emailAddress,
          },
        })
          .then(rows => {
            const pdfFilename = `FoodPrint_Storage_${phoneNumber}`;
            const pdffileextension = '.pdf';
            let filenames = resolveFilenames(pdfFilename, pdffileextension);

            // stream pdf in chunks to response
            let chunks = [];
            pdfService.buildPDF(
              `STORAGE ENTRIES FOR ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}
            ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
              storagepdf(rows),
              chunk => chunks.push(chunk), // stream.write(chunk),
              (err, data) => {
                if (err) {
                  console.log(err);
                  res.status(400).send({ message: err.message });
                }
                const result = Buffer.concat(chunks);
                //DO upload
                let uploadParams = getUploadParams(
                  BucketName,
                  'application/pdf',
                  result,
                  'public-read',
                  filenames.filename
                );
                uploadConnection.upload(uploadParams, function (error, data) {
                  if (error) {
                    console.error(error);
                    res.status(500).send({ error: error, message: 'Unexpected error occurred 😤' });
                    return;
                  }
                  console.log('File uploaded ' + filenames.fileUrl);
                  res.status(200).send({ message: 'file uploaded', pdf_url: filenames.fileUrl });
                });
              }
            );
          })
          .catch(err => {
            console.log('Storage PDF err:' + err);
          });
      })
      .catch(err => {
        res.status(404).send({ error: err, message: 'User not found 😤' });
      });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
  }
});

module.exports = router;
