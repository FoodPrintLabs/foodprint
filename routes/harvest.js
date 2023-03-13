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
const CUSTOM_ENUMS = require('../utils/enums');
const path = require('path');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

const {
  getUploadParams,
  resolveFilenames,
  uploadConnection,
} = require('../config/digitalocean/file-upload');
const { getMimeType } = require('../utils/image_mimetypes');

const pdfService = require('../config/pdf/pdf-service');
const { harvestpdf } = require('../config/pdf/harvestpdf');
//Name of your DO bucket here
const BucketName = process.env.DO_BUCKET_NAME;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tw_client = require('twilio')(accountSid, authToken);

/*   function to determine rows of data that can be seen based on user role */
function getHarvestSqlSearchCondition(user){
  // default permission is to see only rows the user has added
  let sql_search_condition = {
    where: {
      harvest_user: user.email,
    },
    order: [['pk', 'DESC']],
  };

    // admins and superusers can see all records
    if (
        user.role === ROLES.Admin ||
        user.role === ROLES.Superuser
    ) {
      sql_search_condition = {
        order: [['pk', 'DESC']],
      }
    }
    return sql_search_condition;
}

/* GET harvest page. */
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    //these are the only allowed roles to access the page
    if (
      req.user.role === ROLES.Farmer ||
      req.user.role === ROLES.Admin ||
      req.user.role === ROLES.Superuser
    ) {
      // admins and superusers can see all records, whilst farmers can see only records they added
      const sql_search_condition = getHarvestSqlSearchCondition(req.user);

      models.FoodprintHarvest.findAll(sql_search_condition)
        .then(rows => {
          console.log('All harvests:' + rows.length.toString());

          for (let i = 0; i < rows.length; i++) {
            if (rows[i].harvest_image_url === null) {
              rows[i].harvest_image_url = '';
            }
            /*if (rows[i].harvest_photoHash === null) {
              rows[i].harvest_photoHash = '';
            } else {
              rows[i].harvest_photoHash =
                'data:image/png;base64,' +
                Buffer.from(rows[i].harvest_photoHash, 'binary').toString('base64');
            }*/
          }
          res.render('harvestlogbook', {
            page_title: 'FoodPrint - Harvest Logbook',
            data: rows,
            user: req.user,
            page_name: 'harvestlogbook',
          });
        })
        .catch(err => {
          console.log('All harvests err:' + err);
          req.flash('error', err);
          res.render('harvestlogbook', {
            page_title: 'FoodPrint - Harvest Logbook',
            data: '',
            user: req.user,
            page_name: 'harvestlogbook',
          });
        });
    } else
    {
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
  upload.single('viewmodal_harvest_photohash_uploaded_file'),
  [
    //System populated:
    //viewmodal_harvest_added_to_blockchain_date, viewmodal_harvest_capturetime,
    //viewmodal_logdatetime, viewmodal_lastmodifieddatetime and viewmodal_harvest_logid,
    //viewmodal_harvest_blockchainhashid, viewmodal_harvest_blockchainhashdata,
    //viewmodal_harvest_bool_added_to_blockchain ,
    //viewmodal_harvest_user, viewmodal_harvest_blockchain_uuid, viewmodal_harvest_added_to_blockchain_by

    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_suppliername', 'Harvest Supplier Name is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_supplieraddress', 'Harvest Supplier Address value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_producename', 'Harvest Produce Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    //check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    //check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    //check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
  ],

  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.redirect('/app/harvest');
    } else {
      //console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
      let harvest_logid_uuid = uuidv4();
      let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      ); //actual time of harvest in the field
      let harvest_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //time of harvest data entry
      let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

      for (var harvest_description_item in req.body.viewmodal_harvest_description_json) {
        if (req.body.viewmodal_harvest_description_json) {
          let items = req.body.viewmodal_harvest_description_json;
          harvest_description_item = JSON.stringify(items).replace(/]|[[]|"/g, '');
          console.log('items');
          console.log(items);
        }
      }

      console.log('req.body.viewmodal_harvest_description_json');
      console.log(req.body.viewmodal_harvest_description_json);

      console.log('harvest_description_item');
      console.log(harvest_description_item);
      // req.file is the harvest image file i.e. viewmodal_harvest_photohash_uploaded_file
      const img = req.file;

      // req.body will hold the text fields, if there were any
      // harvest_entry is object-key-value pairs
      let harvest_entry = {
        harvest_logid: harvest_logid_uuid,
        harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
        harvest_supplierName: req.body.viewmodal_harvest_suppliername,
        harvest_farmerName: req.body.viewmodal_harvest_farmername,
        year_established: req.body.viewmodal_harvest_year_established,
        covid19_response: req.body.viewmodal_harvest_covid19_response,
        harvest_supplierAddress: req.body.viewmodal_harvest_supplieraddress,
        harvest_produceName: req.body.viewmodal_harvest_producename,
        harvest_TimeStamp: harvest_TimeStamp,
        harvest_CaptureTime: harvest_CaptureTime,
        harvest_Description: req.body.viewmodal_harvest_description,
        harvest_geolocation: req.body.viewmodal_harvest_geolocation,
        harvest_quantity: req.body.viewmodal_harvest_quantity,
        harvest_unitOfMeasure: req.body.viewmodal_harvest_unitofmeasure,
        harvest_description_json: harvest_description_item,
        harvest_BlockchainHashID: '-',
        harvest_BlockchainHashData: '-',
        supplierproduce: req.body.viewmodal_supplierproduce, // e.g. WMPN_BabyMarrow
        harvest_bool_added_to_blockchain: 'false', //true or false
        //harvest_added_to_blockchain_date: NULL, //system generated when add to blockchain is selected
        harvest_added_to_blockchain_by: '-', // user who logged harvest to blockchain
        harvest_blockchain_uuid: '-', // uuid to blockchain config record which has contract and address
        harvest_user: req.user.email, // user who logged harvest
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };
      try {
        fs.readFile(img.path, async function (err, img_datadata) {
          // data['harvest_photoHash'] = img_datadata;

          // console.log(img)
          // console.log(`type ${img.mimetype}`)
          // console.log(`extension ${path.extname(img.originalname)}`)
          const filenames = resolveFilenames(
            harvest_logid_uuid,
            `${path.extname(img.originalname)}`
          );
          const uploadParams = getUploadParams(
            BucketName,
            img.mimetype,
            img_datadata,
            'public-read',
            filenames.filename
          );
          uploadConnection.upload(uploadParams, function (error, data) {
            if (error) {
              console.error(error);
              req.flash('error', error.message);
              res.redirect('/app/harvest');
            } else {
              console.log('File uploaded ' + filenames.fileUrl);

              harvest_entry['harvest_image_url'] = filenames.fileUrl;

              models.FoodprintHarvest.create(harvest_entry)
                .then(_ => {
                  req.flash(
                    'success',
                    'New Harvest entry added successfully! Harvest ID = ' + harvest_logid_uuid
                  );
                  res.redirect('/app/harvest');
                })
                .catch(err => {
                  //throw err;
                  req.flash('error', err.message);
                  // redirect to harvest logbook page
                  res.redirect('/app/harvest');
                });
            }
          });
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
          const sql_search_condition = getHarvestSqlSearchCondition(req.user);

          models.FoodprintHarvest.findAll(sql_search_condition)
            .then(rows => {
              res.render('harvestlogbook', {
                page_title: 'FoodPrint - Harvest Logbook',
                success: false,
                errors: e.array(),
                data: rows,
                user: req.user,
                page_name: 'harvestlogbook',
              });
            })
            .catch(err => {
              console.log('All harvests err:' + err);
              req.flash('error', err.message);
              res.render('harvestlogbook', {
                page_title: 'FoodPrint - Harvest Logbook',
                data: '',
                user: req.user,
                page_name: 'harvestlogbook',
                success: false,
                errors: e.array(),
              });
            });
        }
      }
    }
  }
);

// route create harvest via WhatsApp
router.post('/save/whatsapp', async function (req, res) {

  const createHarvestEntry = function(data){
    try {
      models.FoodprintHarvest.create(data)
        .then(_ => {
          res.status(201).send({ message: 'harvest created', harvest_logid: data.harvest_logid });
        })
        .then(_ => {
          data['harvest_photoHash'] = harvest_photoHash;
          whatsappHarvestToBlockchain(data, protocol, host);
        })
        .catch(err => {
          //throw err;
          console.log(err.message);
          res.status(400).send({ message: err.message });
        });
    } catch (e) {
      //this will eventually be handled by your error handling middleware
      //res.json({success: false, errors:errors.array()});
      console.log(e);
      res.status(500).send({ error: e, message: 'Unexpected error occurred 😤' });
    }
  }


  let harvest_logid_uuid = uuidv4();
  let harvest_TimeStamp = moment(new Date(req.body.harvest_date)).format('YYYY-MM-DD'); //actual time of harvest in the field
  let harvest_CaptureTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //time of harvest data entry
  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let lastmodifieddatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let channel = 'WhatsApp';

  let harvest_photoHash = '';
  let twilio_url = '';
  let host = req.get('host');
  let protocol = 'https';
  let harvest_image_url = '';

  // if running in dev then protocol can be http otherwise if you pass protocol as http for PRODUCTION, axios lib will fail when attempting to write to blockchain i.e. Error: Request failed with status code 404
  if (process.env.NODE_ENV === CUSTOM_ENUMS.DEVELOPMENT) {
    protocol = req.protocol;
  }

  let harvest_entry = {
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
    twilio_url: twilio_url,
    channel: channel,
    // harvest_photoHash,
    harvest_image_url: harvest_image_url ,
  };

  if (req.body.harvestURL) {
    try {
      twilio_url = req.body.harvestURL;
      harvest_entry["twilio_url"] = twilio_url;
      console.log('twilio_url -' + twilio_url);
      const response = await fetch(req.body.harvestURL);
      harvest_photoHash = await response.buffer();

      const [accountID, messageID, mediaID] = twilio_url
        .split("/")
        .slice(4)
        .filter((_, index) => index % 2 === 1);

      console.log('accountID -' + accountID);
      console.log('messageID -' + messageID);
      console.log('mediaID -' + mediaID);


      tw_client.messages(messageID)
        .media(mediaID)
        .fetch()
        .then(media => {
          console.log('twilio media metadata -' + media)
          const contentType = media.contentType
          const [fileType, ext] = contentType.split("/");
          const filenames = resolveFilenames(
            harvest_logid_uuid,
            `.${ext}`
          );
          const uploadParams = getUploadParams(
            BucketName,
            contentType,
            harvest_photoHash,
            'public-read',
            filenames.filename
          );

          uploadConnection.upload(uploadParams, function (error, data) {
            if (error) {
              console.error(error);
            } else {
                console.log('File uploaded ' + filenames.fileUrl);
                harvest_entry["harvest_image_url"] = filenames.fileUrl;
                createHarvestEntry(harvest_entry);
            }
          });
        });

    } catch (e) {
      console.log(e);
    }
  } else {
    createHarvestEntry(harvest_entry);
  }
});

function whatsappHarvestToBlockchain(data, protocol, host) {
  console.log('logging log data');
  console.log(data);

  let postUrl = protocol + '://' + host + '/app/harvest/save/blockchain';
  console.log('logging postUrl');
  console.log(postUrl);

  // we don't have this data from WhatsApp, WhatsApp is harvest lite.
  let harvestDescription = '';
  let harvestSupplierShortcode = '';
  let harvestDescriptionJSON = '';

  //buyerID is generic version of marketID, it represents an intermediary buying the produce
  let otherIdentifiers = '{' + 'sourceID:' + harvestSupplierShortcode + ', ' + 'buyerID:' + '}';

  //actionTimestamp is generic for harvest time, storage time etc
  let logDetail =
    '{' +
    'produce:' +
    data.harvest_produceName +
    ', ' +
    'description:' +
    harvestDescription +
    ', ' +
    'actionTimeStamp:' +
    data.harvest_TimeStamp +
    ', ' +
    'logQuantity:' +
    data.harvest_quantity +
    '(' +
    data.harvest_unitOfMeasure +
    ')' +
    '}';

  let logExtendedDetail = '{' + 'growingConditions:' + harvestDescriptionJSON + '}';

  let photoHash = hash.update(data.harvest_photoHash).digest('base64');

  console.log('harvest_photohash successfully hashed (hash value ' + photoHash + ').');
  let logMetadata =
    '{' +
    'logUser:' +
    data.harvest_user +
    ', ' +
    'logType:' +
    'harvest' +
    ', ' +
    'logTableName:' +
    'foodprint_harvest' +
    ', ' +
    'harvestPhotoHash:' +
    photoHash +
    ',' +
    'logSource:' +
    'WhatsApp' +
    '}';

  var summaryData = {};
  summaryData.logID = data.harvest_logid;
  summaryData.previouslogID = '';
  summaryData.otherIdentifiers = otherIdentifiers;
  summaryData.logDetail = logDetail;
  summaryData.logExtendedDetail = logExtendedDetail;
  summaryData.logMetadata = logMetadata;

  console.log('logging summaryData for blockchain');
  console.log(summaryData);

  axios
    .post(postUrl, summaryData, {})
    .then(function (response) {
      console.log(`statusCode: ${response.status}`);
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

//route for update data
router.post(
  '/update',
  upload.none(),
  [
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_suppliername', 'Harvest Supplier Name is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_supplieraddress', 'Harvest Supplier Address value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_producename', 'Harvest Produce Name value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid')
      .not()
      .isEmpty(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty(),
    check(
      'viewmodal_harvest_added_to_blockchain_by',
      'Harvest Added to Blockchain by value is not valid'
    )
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_harvest_user', 'Harvest User value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid')
      .not()
      .isEmpty(),
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
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
      res.redirect('/app/harvest');
    } else {
      console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
      let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let harvest_CaptureTime = moment(new Date(req.body.viewmodal_harvest_capturetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let logdatetime = moment(new Date(req.body.viewmodal_logdatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      let lastmodifieddatetime = moment(new Date(req.body.viewmodal_lastmodifieddatetime)).format(
        'YYYY-MM-DD HH:mm:ss'
      );

      let data = {
        harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
        harvest_supplierName: req.body.viewmodal_harvest_suppliername,
        harvest_farmerName: req.body.viewmodal_harvest_farmername,
        harvest_supplierAddress: req.body.viewmodal_harvest_supplieraddress,
        year_established: req.body.viewmodal_harvest_year_established,
        covid19_response: req.body.viewmodal_harvest_covid19_response,
        harvest_produceName: req.body.viewmodal_harvest_producename,
        //harvest_photoHash: req.body.viewmodal_harvest_photohash,
        harvest_TimeStamp: harvest_TimeStamp,
        harvest_CaptureTime: harvest_CaptureTime,
        harvest_Description: req.body.viewmodal_harvest_description,
        harvest_geolocation: req.body.viewmodal_harvest_geolocation,
        harvest_quantity: req.body.viewmodal_harvest_quantity,
        harvest_unitOfMeasure: req.body.viewmodal_harvest_unitofmeasure,
        // harvest_description_json: req.body.viewmodal_harvest_description_json,
        harvest_BlockchainHashID: req.body.viewmodal_harvest_blockchainhashid,
        harvest_BlockchainHashData: req.body.viewmodal_harvest_blockchainhashdata,
        supplierproduce: req.body.viewmodal_supplierproduce,
        harvest_bool_added_to_blockchain: req.body.viewmodal_harvest_bool_added_to_blockchain,
        //harvest_added_to_blockchain_date: req.body.viewmodal_harvest_added_to_blockchain_date,
        harvest_added_to_blockchain_by: req.body.viewmodal_harvest_added_to_blockchain_by,
        harvest_blockchain_uuid: req.body.viewmodal_harvest_blockchain_uuid,
        harvest_user: req.body.viewmodal_harvest_user,
        logdatetime: logdatetime,
        lastmodifieddatetime: lastmodifieddatetime,
      };
      try {
        models.FoodprintHarvest.update(data, {
          where: {
            harvest_logid: req.body.viewmodal_harvest_logid,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Harvest entry updated successfully! Harvest ID = ' + req.body.viewmodal_harvest_logid
            );
            res.redirect('/app/harvest');
          })
          .catch(err => {
            //throw err;
            console.log('Error - Update Harvest failed');
            console.log(err);
            req.flash('error', err.message);
            // redirect to harvest logbook page
            res.redirect('/app/harvest');
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
          const sql_search_condition = getHarvestSqlSearchCondition(req.user);

          models.FoodprintHarvest.findAll(sql_search_condition)
            .then(rows => {
              res.render('harvestlogbook', {
                page_title: 'FoodPrint - Harvest Logbook',
                success: false,
                errors: e.array(),
                data: rows,
                user: req.user,
                page_name: 'harvestlogbook',
              });
            })
            .catch(err => {
              req.flash('error', err.message);
              res.render('harvestlogbook', {
                page_title: 'FoodPrint - Harvest Logbook',
                data: '',
                user: req.user,
                page_name: 'harvestlogbook',
                success: false,
                errors: e.array(),
              });
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
  upload.none(),
  [
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  function (req, res) {
    console.log('configid ' + req.body.viewmodal_harvest_logid);
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintHarvest.destroy({
        where: {
          harvest_logid: req.body.viewmodal_harvest_logid,
        },
      })
        .then(_ => {
          req.flash(
            'success',
            'Harvest entry deleted successfully! Harvest ID = ' + req.body.viewmodal_harvest_logid
          );
          res.redirect('/app/harvest');
        })
        .catch(err => {
          //throw err;
          req.flash('error', err.message);
          // redirect to harvest logbook page
          res.redirect('/app/harvest');
        });
    } else
    {
      req.flash(
          'error',
          'You are not authorised to delete Harvest records.'
      );
      res.redirect('/app/harvest');
    }
  }
);

/* GET PDF of all Harvest records (as an admin) - webapp */
router.get('/pdf/all',
    require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
    function (req, res) {
      models.FoodprintHarvest.findAll({
        attributes: [
          'harvest_logid',
          'harvest_farmerName',
          'harvest_produceName',
          'harvest_TimeStamp',
          'harvest_quantity',
          'harvest_unitOfMeasure',
          'blockchain_explorer_url',
        ],
        order: [['pk', 'DESC']],
      })
          .then(rows => {
            const pdffileextension = '.pdf';
            const username = req.user.username
            const useremail = req.user.email
            const pdfFilename = `FoodPrint_Harvest_Admin_${username}_${moment(new Date()).format('YYYY-MM-DD')}`;
            const filenames = resolveFilenames(pdfFilename, pdffileextension);

            const stream = res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment;filename=' + filenames.filename,
            });
            pdfService.buildPDF(
                `MASTER HARVEST ENTRIES GENERATED BY ADMIN ${username} ${useremail}
                ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
                harvestpdf(rows),
                chunk => stream.write(chunk),
                () => stream.end()
            );
          })
          .catch(err => {
            console.log('Harvest PDF err:' + err);
            req.flash('error', err);
          });
    }
);

/* GET PDF of Harvest record for farmer - webapp */
router.get('/pdf',
    require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
    function (req, res) {
      models.FoodprintHarvest.findAll({
            attributes: [
              'harvest_logid',
              'harvest_farmerName',
              'harvest_produceName',
              'harvest_TimeStamp',
              'harvest_quantity',
              'harvest_unitOfMeasure',
              'blockchain_explorer_url',
            ],
            order: [['pk', 'DESC']],
            where: {
              harvest_user: req.user.email,
            },
          })
              .then(rows => {
                const pdffileextension = '.pdf';
                const username = req.user.username
                const useremail = req.user.email
                const pdfFilename = `FoodPrint_Harvest_${username}_${moment(new Date()).format('YYYY-MM-DD')}`;
                const filenames = resolveFilenames(pdfFilename, pdffileextension);

                const stream = res.writeHead(200, {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': 'attachment;filename=' + filenames.filename,
                });
                pdfService.buildPDF(
                  `HARVEST ENTRIES FOR ${username} ${useremail}
                ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
                  harvestpdf(rows),
                  chunk => stream.write(chunk),
                  () => stream.end()
                );
              })
              .catch(err => {
                console.log('Harvest PDF err:' + err);
                req.flash('error', err);
              });
    }
);

/* GET PDF of Harvest record for farmer - whatsapp */
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
        models.FoodprintHarvest.findAll({
          attributes: [
            'harvest_logid',
            'harvest_farmerName',
            'harvest_produceName',
            'harvest_TimeStamp',
            'harvest_quantity',
            'harvest_unitOfMeasure',
            'blockchain_explorer_url',
          ],
          order: [['pk', 'DESC']],
          where: {
            harvest_user: emailAddress,
          },
        })
          .then(rows => {
            const pdfFilename = `FoodPrint_Harvest_${phoneNumber}`;
            const pdffileextension = '.pdf';
            let filenames = resolveFilenames(pdfFilename, pdffileextension);

            // stream pdf in chunks to response
            let chunks = [];
            pdfService.buildPDF(
              `HARVEST ENTRIES FOR ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}
            ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
              harvestpdf(rows),
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
            console.log('Harvest PDF err:' + err);
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

router.get(
  '/migrateimages',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintHarvest.findAll({
        order: [['pk', 'ASC']],
      })
        .then(rows => {
          let message = 'completed successfully';
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].harvest_photoHash === null) {
              console.log(`no image for harvest ${rows[i].harvest_logid}`);
            } else {
              try {
                const imageBuffer = Buffer.from(rows[i].harvest_photoHash, 'binary');
                const metadata = getMimeType(imageBuffer);
                const filenames = resolveFilenames(rows[i].harvest_logid, metadata.ext);
                const uploadParams = getUploadParams(
                  BucketName,
                  metadata.contentType,
                  imageBuffer,
                  'public-read',
                  filenames.filename
                );
                uploadConnection.upload(uploadParams, function (error, data) {
                  if (error) {
                    console.error(error);
                  } else {
                    console.log('File uploaded ' + filenames.fileUrl);
                    const harvest_entry = {
                      harvest_image_url: filenames.fileUrl,
                    };

                    models.FoodprintHarvest.update(harvest_entry, {
                      where: {
                        harvest_logid: rows[i].harvest_logid,
                      },
                    })
                      .then(_ => {
                        console.log(`updated image for ${rows[i].harvest_logid}`);
                      })
                      .catch(err => {
                        //throw err;
                        console.log('Error - Update Harvest failed');
                        console.log(err);
                        message = 'completed with errors please check console';

                      });
                  }
                });
              } catch (e) {
                console.log(e);
                console.log(`error on harvest ${rows[i].harvest_logid}`);
                message = 'completed with errors please check console';
              }
            }
          }
          res.json({ message: message });
        })
        .catch(err => {
          console.log('All harvests err:' + err);
          res.json({ error: err });
        });
    } else {
      res.json({ message: 'not authorised' });
    }
  }
);

router.post(
  '/getimagehash',
  async function(req, res, next) {
    const response = await fetch(req.body.url);
    const image_hash = await response.buffer();
    const hash256 = crypto.createHash('sha256').update(image_hash).digest('base64');
    res.send(hash256);
  }
);

module.exports = router;
