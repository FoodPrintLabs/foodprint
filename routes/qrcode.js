var express = require('express');
const { check, validationResult, sanitizeParam } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
var router = express.Router();
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const CUSTOM_ENUMS = require('../utils/enums');
const uuidv4 = require('uuid/v4');
var ROLES = require('../utils/roles');
var QRCode = require('qrcode');
var moment = require('moment'); //datetime
var models = initModels(sequelise);
var crypto = require('crypto');
const hash = crypto.createHash('sha256');
const env = process.env.NODE_ENV || 'development';
let fs = require('fs');

//Digital Ocean File Upload
const {
  uploadConnection,
  getUploadParams,
  resolveFilenames,
} = require('../config/digitalocean/file-upload');

const multerS3 = require('multer-s3');
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files

//Name of your DO bucket here
const BucketName = process.env.DO_BUCKET_NAME;

//upload header added to route
const upload = multer({
  storage: multerS3({
    s3: uploadConnection,
    bucket: BucketName,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      //Logic for file uploaded + access to req data
      //console.log(file);
      //mimetype split for ext - safe with image mimetypes (image/png, image/jpeg) not others
      let extArray = file.mimetype.split('/');
      let extension = extArray[extArray.length - 1];
      cb(
        null,
        (
          req.body.qrcode_company_name +
          moment(new Date()).format('YYYY-MM-DD') +
          '.' +
          extension
        ).toLowerCase()
      );
    },
  }),
});

//market checkin XmlHTTP request
router.post(
  '/marketcheckin',
  [check('checkin_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail()],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array(), success: false });
    } else {
      var checkin_market_id = req.body.checkin_market_id;
      var checkin_email = req.body.checkin_email;
      var checkin_datetime = new Date();
      var checkin_firstname = '';
      var checkin_surname = '';

      let data = {
        market_id: checkin_market_id,
        firstname: checkin_firstname,
        surname: checkin_surname,
        email: checkin_email,
        logdatetime: checkin_datetime,
      };
      try {
        models.MarketSubscription.create(data)
          .then(_ => {
            console.log('add market_subscription DB success');
            res.json({ success: true, email: checkin_email });
          })
          .catch(err => {
            //req.flash('error', err);
            console.error('error', err);
            res.status.json({ err: err });
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        res.json({ success: false, errors: e });
      }
    }
  }
);

//return template with market checkin form e.g. http://localhost:3000/app/checkin/ozcf
router.get(
  '/checkin/:market_id',
  [sanitizeParam('market_id').escape().trim()],
  function (req, res) {
    var boolCheckinForm = process.env.SHOW_CHECKIN_FORM || false;
    var marketID = req.params.market_id; //shortcode e.g. ozcf
    var logid = uuidv4();
    var qrid = ''; //TODO this is not yet being tracked in config
    var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var request_host = req.get('host');
    var request_origin = req.headers.referer;
    //req.headers.referer - The Referer request header contains the address of the previous web page
    //from which a link to the currently requested page was followed.
    //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.

    //alternative would have been to use origin request header
    //The Origin request header indicates where a fetch originates from.

    var request_useragent = req.headers['user-agent'];
    var logdatetime = new Date();

    //TODO - cross check marketID against existing marketID's from foodprint_market

    try {
      let data = {
        logid: logid,
        qrid: qrid,
        qrurl: qrurl,
        marketID: marketID,
        request_host: request_host,
        request_origin: request_origin,
        request_useragent: request_useragent,
        logdatetime: logdatetime,
      };

      models.FoodprintQrcount.create(data)
        .then(() => {
          console.log('Market checkin tracking successful');
          //res.json({ success: true, email: checkin_email });
        })
        .catch(err => {
          //req.flash('error', err);
          //console.error('error', err)
          console.error('Market checkin tracking error occured');
          // res.status.json({ err: err });
        });
    } catch (e) {
      //TODO log the error
      //this will eventually be handled by your error handling middleware
      //next(e)
      //res.json({success: false, errors: e});
      //console.error('error', err)
      console.error('Market checkin tracking error occured');
      res.render('checkin.ejs', {
        data: marketID,
        showCheckinForm: boolCheckinForm,
        user: req.user,
        page_name: 'checkin',
      });
    }
    res.render('checkin.ejs', {
      data: marketID,
      showCheckinForm: boolCheckinForm,
      user: req.user,
      page_name: 'checkin',
    });
  }
);

//return template with scan results for produce 0.e. http://localhost:3000/app/scan/WMNP_Fennel
//TODO Return Farmers email address as part of provenance_data
//TODO Update to include marketid '/app/scan/:marketid/:id' 0.e. http://localhost:3000/app/scan/ozcf/WMNP_Fennel
router.get('/scan/:id', [sanitizeParam('id').escape().trim()], function (req, res) {
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel

  let weeklyViewQuery;
  let testProvenance;
  let baseAttributes = [
    'harvest_supplierShortcode',
    'harvest_supplierName',
    'harvest_farmerName',
    'year_established',
    'harvest_description_json',
    // 'harvest_photoHash',
    'harvest_image_url',
    'harvest_supplierAddress',
    'harvest_produceName',
    'harvest_TimeStamp',
    'harvest_CaptureTime',
    'harvest_Description',
    'harvest_geolocation',
    'supplierproduce',
    'market_Address',
    'market_storageTimeStamp',
    'market_storageCaptureTime',
    'logdatetime',
    'lastmodifieddatetime',
  ];

  if (supplierProduceID.split('_')[0] === CUSTOM_ENUMS.TEST) {
    // e.g. https://www.foodprintapp.com/app/scan/TEST_beetroot

    testProvenance = true;
    //return single latest entry for supplierproduce
    /*var traceSqlFinal = traceSqlBase + 'ORDER BY logdatetime DESC LIMIT 1;'*/

    weeklyViewQuery = {
      attributes: baseAttributes,
      where: {
        supplierproduce: supplierProduceID,
      },
      order: [['logdatetime', 'DESC']],
      limit: 1,
    };
  } else {
    //return latest weekly entry using ozcf protocol
    testProvenance = false;

    weeklyViewQuery = {
      attributes: baseAttributes,
      where: {
        [Op.and]: [
          { supplierproduce: supplierProduceID },
          {
            logdatetime: {
              [Op.lt]: Sequelize.literal(
                '(date(curdate() - interval weekday(curdate()) day + interval 1 week))'
              ),
            },
          },
          {
            logdatetime: {
              [Op.gt]: Sequelize.literal('(date(curdate() - interval weekday(curdate()) day))'),
            },
          },
        ],
      },
    };
  }
  // console.debug('Final provenance SQL query ' + traceSqlFinal);
  console.debug('Final provenance SQL query params ' + supplierProduceID);

  let provenance_data = '';
  models.FoodprintWeeklyview.findAll(weeklyViewQuery)
    .then(rows => {
      if (typeof rows !== 'undefined' && rows.length) {
        // TODO - Use sharp library to attempt to resize base64 and if error, set flag that image invalid
        //  https://stackoverflow.com/questions/51010423/how-to-resize-base64-image-in-javascript

        // convert your binary data to base64 format & then pass it to ejs
        /*if (rows[0].harvest_photoHash === null) {
          rows[0].harvest_photoHash = '';
        } else {
          rows[0].harvest_photoHash =
            'data:image/png;base64,' +
            Buffer.from(rows[0].harvest_photoHash, 'binary').toString('base64');
        }*/
      }
      provenance_data = rows;
      console.log('Provenance scan successful');
    })
    .catch(err => {
      //req.flash('error', err);
      provenance_data = '';
      console.error('error', err);
      console.error('Provenance scan error occured');
    })
    .finally(() => {
      var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false;

      //START Track QR Scan (this could be done as xhr when scan page is rendered)
      var marketID = CUSTOM_ENUMS.OZCF; //shortcode e.g. ozcf
      var logid = uuidv4();
      var qrid = supplierProduceID; //TODO this is not yet being tracked in config

      //http://localhost:3000/app/scan/WMNP_Fennel
      //https://www.foodprintapp.com/app/scan/WMNP_Fennel
      var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;

      var request_host = req.get('host');
      var request_origin = req.headers.referer;
      //req.headers.referer - The Referer request header contains the address of the previous web page
      //from which a link to the currently requested page was followed.
      //The Referer header allows servers to identify where people are visiting them from and
      // may use that data for analytics, logging, or optimized caching, for example.

      //alternative would have been to use origin request header
      //The Origin request header indicates where a fetch originates from.

      var request_useragent = req.headers['user-agent'];
      var logdatetime = new Date();
      var qrtype = 'Supplier Produce';
      var qrlogid = 'NA';
      var user_email = 'FoodPrint';
      var location = 'NA';
      //TODO - cross check marketID and supplierProduceID against existing marketID's from foodprint_market and foodPrint_supplierproduceid
      //using connection.query and not connection.execute because of
      // TypeError: Bind parameters must not contain undefined. To pass SQL NULL specify JS null
      let data = {
        logid: logid,
        qrid: qrid,
        qrurl: qrurl,
        marketid: marketID,
        request_host: request_host,
        request_origin: request_origin,
        request_useragent: request_useragent,
        logdatetime: logdatetime,
        qrtype: qrtype,
        qrlogid: qrlogid,
        //Is it possible to get farmer email?
        user_email: user_email,
        location: location,
      };

      models.FoodprintQrcount.create(data)
        .then(_ => {
          console.log('Produce scan tracking successful');
        })
        .catch(err => {
          console.error('Produce scan tracking error occurred');
          console.error('error', err);
        });

      res.render('scanresult', {
        data: provenance_data,
        user: req.user,
        showTracedOnBlockchain: boolTracedOnBlockchain,
        testRecord: testProvenance,
        page_name: 'scanresult',
      });
    });
});

//REST API Get a single produce data record (twin to router.get('/app/scan/:id'))
//return json with scan results for produce http://localhost:3000/app/api/v1/scan/WMNP_Fennel
//TODO Update to include marketid '/app/scan/:marketid/:id' 0.e. http://localhost:3000/app/api/v1/scan/ozcf/WMNP_Fennel
router.get('/api/v1/scan/:id', [sanitizeParam('id').escape().trim()], function (req, res) {
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel

  let weeklyViewQuery;
  let testProvenance;
  let baseAttributes = [
    'harvest_supplierShortcode',
    'harvest_supplierName',
    'harvest_farmerName',
    'year_established',
    'harvest_description_json',
    // 'harvest_photoHash',
    'harvest_image_url',
    'harvest_supplierAddress',
    'harvest_produceName',
    'harvest_TimeStamp',
    'harvest_CaptureTime',
    'harvest_Description',
    'harvest_geolocation',
    'supplierproduce',
    'market_Address',
    'market_storageTimeStamp',
    'market_storageCaptureTime',
    'logdatetime',
    'lastmodifieddatetime',
  ];

  if (supplierProduceID.split('_')[0] === CUSTOM_ENUMS.TEST) {
    // e.g. https://www.foodprintapp.com/app/scan/TEST_beetroot
    //http://localhost:3000/app/api/v1/scan/TEST_Beetroot

    testProvenance = true;
    //return single latest entry for supplierproduce

    weeklyViewQuery = {
      attributes: baseAttributes,
      where: {
        supplierproduce: supplierProduceID,
      },
      order: [['logdatetime', 'DESC']],
      limit: 1,
    };
  } else {
    //return latest weekly entry using ozcf protocol
    testProvenance = false;

    weeklyViewQuery = {
      attributes: baseAttributes,
      where: {
        [Op.and]: [
          { supplierproduce: supplierProduceID },
          {
            logdatetime: {
              [Op.lt]: Sequelize.literal(
                '(date(curdate() - interval weekday(curdate()) day + interval 1 week))'
              ),
            },
          },
          {
            logdatetime: {
              [Op.gt]: Sequelize.literal('(date(curdate() - interval weekday(curdate()) day))'),
            },
          },
        ],
      },
    };
  }

  let provenance_data = [];
  models.FoodprintWeeklyview.findAll(weeklyViewQuery)
    .then(rows => {
      if (typeof rows !== 'undefined' && rows.length) {
        // TODO - Use sharp library to attempt to resize base64 and if error, set flag that image invalid
        //  https://stackoverflow.com/questions/51010423/how-to-resize-base64-image-in-javascript

        // convert your binary data to base64 format & then pass it to ejs
        /*if (rows[0].harvest_photoHash === null) {
          rows[0].harvest_photoHash = '';
        } else {
          rows[0].harvest_photoHash =
            'data:image/png;base64,' +
            Buffer.from(rows[0].harvest_photoHash, 'binary').toString('base64');
        }*/
        provenance_data = rows[0]; // return 1st row only
      } else {
        provenance_data = []; // return empty list for no data
      }

      console.log('Provenance scan successful');
    })
    .catch(err => {
      //req.flash('error', err);
      provenance_data = [];
      console.error('error', err);
      console.error('Provenance scan error occured');
      //res.render('scanresult',{data:'', user:req.user});
    })
    .finally(() => {
      var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false;

      //START Track QR Scan (this could be done as xhr when scan page is rendered)
      var marketID = 'ozcf'; //shortcode e.g. ozcf
      var logid = uuidv4();
      var qrid = ''; //TODO this is  t yet being tracked in config

      //http://localhost:3000/app/scan/WMNP_Fennel
      //https://www.foodprintapp.com/app/scan/WMNP_Fennel
      var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;

      var request_host = req.get('host');
      var request_origin = req.headers.referer;
      //req.headers.referer - The Referer request header contains the address of the previous web page
      //from which a link to the currently requested page was followed.
      //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.

      //alternative would have been to use origin request header
      //The Origin request header indicates where a fetch originates from.

      var request_useragent = req.headers['user-agent'];
      var logdatetime = new Date();

      //END Track QR Scan
      provenance_data['user'] = req.user;
      provenance_data['showTracedOnBlockchain'] = boolTracedOnBlockchain;
      provenance_data['page_name'] = 'home';
      //res.end() method to send data to client as json string via JSON.stringify() methoD
      res.end(JSON.stringify(provenance_data, null, 4));
    });
});

//Render qrcode EJS
router.get(
  '/qrcode',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintQRCode.findAll({
        where: {
          user_email: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(async rows => {
          //create array of URL data
          const qrcodes = [];
          for (var i = 0; i < rows.length; i++) {
            var qrcode_image = await QRCode.toDataURL(rows[i].qrcode_url);
            qrcodes.push(qrcode_image);
          }
          //console.log(qrcodes);
          res.render('dashboard_qrcode_static', {
            page_title: 'FoodPrint - QR Code Dashboard',
            data: rows,
            user: req.user,
            qrcodes: qrcodes,
            filter_data: '',
            page_name: 'dashboard_qrcode_static',
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_static err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_static', {
            page_title: 'FoodPrint - QR Code Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_static',
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
//ROUTE TO INSERT QRCODE DATA
router.post(
  '/qrcode/save',
  upload.array('qrcode_company_logo_uploaded_file', 1),
  [
    check('qrcode_company_name', 'Your company name is not valid').not().isEmpty().trim().escape(),
    check('qrcode_company_founded', 'Your your founded year is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_contact_email', 'Your contact email is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_website', 'Your website is not valid').not().isEmpty().trim().escape(),
    check('qrcode_description', 'Your QR Code description is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_product_name', 'Your Product Name is not valid').not().isEmpty().trim().escape(),
    check('qrcode_product_description', 'Your Product description is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  function (req, res) {
    console.log('Successfully uploaded ' + req.files.length + ' files!');
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('dashboard_qrcode_static', {
        page_title: 'FoodPrint - QR Code Configuration Dashboard',
        data: '',
        user: req.user,
        page_name: 'dashboard_qrcode_static',
      }); //should add error array here
    } else {
      //File Names needed for saving
      let logoFilename = req.body.qrcode_company_name + moment(new Date()).format('YYYY-MM-DD');
      //mimetype extension setting
      let logofileextension = '';
      if (req.files[0].mimetype == 'image/jpeg') {
        logofileextension = '.jpeg';
      } else if (req.files[0].mimetype == 'image/png') {
        logofileextension = '.png';
      } else if (req.files[0].mimetype == 'image/jpg') {
        logofileextension = '.jpg';
      }

      let filenames = resolveFilenames(logoFilename, logofileextension);
      //QRCODE
      //check environment product was saved in for URL
      let host = req.get('host');
      let protocol = 'https';
      // if running in dev then protocol can be http
      if (process.env.NODE_ENV === CUSTOM_ENUMS.DEVELOPMENT) {
        protocol = req.protocol;
      }
      let supplier_product = (
        req.body.qrcode_company_name +
        '-' +
        req.body.qrcode_product_name +
        '-' +
        req.body.qrcode_contact_email
      )
        .split(' ')
        .join('');
      let hashID = crypto.createHash('sha256').update(supplier_product).digest('hex');
      let qrURL = protocol + '://' + host + '/app/qrcode/static/' + hashID;

      let qrid = uuidv4();
      let data = {
        qrcode_logid: qrid,
        qrcode_company_name: req.body.qrcode_company_name,
        qrcode_company_founded: req.body.qrcode_company_founded,
        qrcode_contact_email: req.body.qrcode_contact_email,
        qrcode_website: req.body.qrcode_website,
        qrcode_facebook: req.body.qrcode_facebook,
        qrcode_twitter: req.body.qrcode_twitter,
        qrcode_instagram: req.body.qrcode_instagram,
        qrcode_url: qrURL,
        qrcode_image_url: qrURL,
        qrcode_description: req.body.qrcode_description,
        qrcode_company_logo_url: filenames.fileUrl,
        qrcode_product_name: req.body.qrcode_product_name,
        qrcode_product_description: req.body.qrcode_product_description,
        qrcode_hashid: hashID,
        qrcode_supplier_product: supplier_product,
        user_email: req.user.email,
        qrcode_logdatetime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      try {
        models.FoodprintQRCode.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New QR Code Configuration added successfully! QR Code company name = ' +
                req.body.qrcode_company_name
            );
            res.redirect('/app/qrcode');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/qrcode');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('dashboard_qrcode_static', {
          page_title: 'FoodPrint - QR Code Configuration Dashboard',
          data: '',
          success: false,
          user: req.user,
          errors: e.array(),
          page_name: 'dashboard_qrcode_static',
        });
      }
    }
  }
);

//Update QRCODE

router.post(
  '/qrcode/update',
  [
    check('qrcode_company_name', 'Your company name is not valid').not().isEmpty().trim().escape(),
    check('qrcode_company_founded', 'Your your founded year is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_contact_email', 'Your contact email is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_website', 'Your website is not valid').not().isEmpty().trim().escape(),
    check('qrcode_description', 'Your QR Code description is not valid')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('qrcode_product_name', 'Your Product Name is not valid').not().isEmpty().trim().escape(),
    check('qrcode_product_description', 'Your Product description is not valid')
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
      req.flash('error', errors);
      res.render('dashboard_qrcode_static', {
        page_title: 'FoodPrint - QR Code Configuration Dashboard',
        data: '',
        page_name: 'dashboard_qrcode_static',
      }); //should add error array here
    } else {
      let data = {
        qrcode_logid: req.body.qrcode_logid,
        qrcode_company_name: req.body.qrcode_company_name,
        qrcode_company_founded: req.body.qrcode_company_founded,
        qrcode_contact_email: req.body.qrcode_contact_email,
        qrcode_website: req.body.qrcode_website,
        qrcode_facebook: req.body.qrcode_facebook,
        qrcode_twitter: req.body.qrcode_twitter,
        qrcode_instagram: req.body.qrcode_instagram,
        qrcode_description: req.body.qrcode_description,
        qrcode_product_name: req.body.qrcode_product_name,
        qrcode_product_description: req.body.qrcode_product_description,
        user_email: req.user.email,
        qrcode_logdatetime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      try {
        models.FoodprintQRCode.update(data, {
          where: {
            qrcode_logid: req.body.qrcode_logid,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Updated QR Code Configuration added successfully! QR Code company name = ' +
                req.body.qrcode_company_name
            );
            res.redirect('/app/qrcode');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/qrcode');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('dashboard_qrcode_static', {
          page_title: 'FoodPrint - QR Code Configuration Dashboard',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'dashboard_qrcode_static',
        });
      }
    }
  }
);

//Delete qrcode
router.post('/qrcode/delete', [], function (req, res) {
  console.log('QRCODE ID - ' + req.body.qrcode_logid2);
  if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
    models.FoodprintQRCode.destroy({
      where: {
        qrcode_logid: req.body.qrcode_logid2,
      },
    })
      .then(_ =>
        models.FoodprintQRCodeProductAttributes.destroy({
          where: {
            qrcode_logid: req.body.qrcode_logid2,
          },
        })
      )
      .then(_ => {
        req.flash(
          'success',
          'QR Code deleted successfully! QRCODE ID = ' +
            req.body.qrcode_logid2 +
            ' and name = ' +
            req.body.qrcode_company_name2 +
            ' as well as all related Attributes'
        );
        res.redirect('/app/qrcode');
      })
      .catch(err => {
        //throw err;
        req.flash('error', err.message);
        // redirect to qrcode logbook page
        res.redirect('/app/qrcode');
      });
  }
});

//Render qrcode attribute EJS
router.get(
  '/qrcode/attribute/:qrid',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintQRCodeProductAttributes.findAll({
        where: {
          qrcode_logid: req.params.qrid,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows =>
          models.FoodprintQRCode.findAll({
            where: {
              qrcode_logid: req.params.qrid,
            },
            order: [['pk', 'DESC']],
          }).then(qrcoderows => {
            res.render('dashboard_qrcode_attributes', {
              page_title: 'FoodPrint - QR Code Dashboard',
              data: rows,
              qrdata: req.params.qrid,
              user: req.user,
              qrcodedata: qrcoderows,
              filter_data: '',
              page_name: 'dashboard_qrcode_attributes',
            });
          })
        )
        .catch(err => {
          console.log('All dashboard_qrcode_attributes err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_attributes', {
            page_title: 'FoodPrint - QR Code Dashboard',
            data: '',
            qrdata: '',
            qrcodedata: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_attributes',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        filter_data: '',
        qrcodedata: '',
        page_name: 'error',
      });
    }
  }
);

//ADD Attribute to QRCODE
router.post(
  '/qrcode/attribute/save',
  [
    check('product_attribute', 'Your company name is not valid').not().isEmpty().trim().escape(),
    check('product_attribute_description', 'Your your founded year is not valid')
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
      req.flash('error', errors);
      res.render('dashboard_qrcode_attributes', {
        page_title: 'FoodPrint - QR Code Configuration Dashboard',
        data: '',
        page_name: 'dashboard_qrcode_attributes',
      }); //should add error array here
    } else {
      let data = {
        qrcode_logid: req.body.qrcode_logid,
        attribute_id: uuidv4(),
        product_attribute: req.body.product_attribute,
        product_attribute_description: req.body.product_attribute_description,
        qrcode_hashid: req.body.qrcode_hashid,
      };
      try {
        models.FoodprintQRCodeProductAttributes.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New QR Code Attribute added successfully! Attribute = ' + req.body.product_attribute
            );
            res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid);
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid);
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('dashboard_qrcode_attributes', {
          page_title: 'FoodPrint - QR Code Attribute Dashboard',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'dashboard_qrcode_attributes',
        });
      }
    }
  }
);

//UPDATE Attribute for QRCODE
router.post(
  '/qrcode/attribute/update/',
  [
    check('product_attribute', 'Your company name is not valid').not().isEmpty().trim().escape(),
    check('product_attribute_description', 'Your your founded year is not valid')
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
      req.flash('error', errors);
      res.render('dashboard_qrcode_attributes', {
        page_title: 'FoodPrint - QR Code Configuration Dashboard',
        data: '',
        page_name: 'dashboard_qrcode_attributes',
      }); //should add error array here
    } else {
      let data = {
        qrcode_logid: req.body.qrcode_logid,
        attribute_id: req.body.attribute_id,
        product_attribute: req.body.product_attribute,
        product_attribute_description: req.body.product_attribute_description,
      };
      try {
        models.FoodprintQRCodeProductAttributes.update(data, {
          where: {
            attribute_id: req.body.attribute_id,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Updated QR Code Attribute successfully! Attribute = ' + req.body.product_attribute
            );
            res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid);
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid);
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('dashboard_qrcode_attributes', {
          page_title: 'FoodPrint - QR Code Attribute Dashboard',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'dashboard_qrcode_attributes',
        });
      }
    }
  }
);

//DELETE Attribute of QRCODE
router.post('/qrcode/attribute/delete/', [], function (req, res) {
  console.log('Attribute ID - ' + req.body.attribute_id);
  if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
    models.FoodprintQRCodeProductAttributes.destroy({
      where: {
        attribute_id: req.body.attribute_id2,
      },
    })
      .then(_ => {
        req.flash('success', 'QR Code deleted successfully! Attribute ID = ' + req.body.attrid);
        res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid2);
      })
      .catch(err => {
        //throw err;
        req.flash('error', err.message);
        // redirect to qrcode logbook page
        res.redirect('/app/qrcode/attribute/' + req.body.qrcode_logid2);
      });
  }
});

//Render qrcode attribute timeline EJS
router.get(
  '/qrcode/static/:hashID',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintQRCodeProductAttributes.findAll({
        where: {
          qrcode_hashid: req.params.hashID,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows =>
          models.FoodprintQRCode.findAll({
            where: {
              qrcode_hashid: req.params.hashID,
            },
            order: [['pk', 'DESC']],
          }).then(qrcoderows => {
            var marketID = 'NA';
            var logid = uuidv4();
            var qrid = req.params.hashID; //Param similar to scan route
            var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;
            var request_host = req.get('host');
            var request_origin = req.headers.referer;
            //req.headers.referer - The Referer request header contains the address of the previous web page
            //from which a link to the currently requested page was followed.
            //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.
            var request_useragent = req.headers['user-agent'];
            var logdatetime = new Date();
            var qrtype = 'Static';
            var user_email = qrcoderows[0].user_email;
            var qrlogid = qrcoderows[0].qrcode_logid;

            //TODO location
            var location = 'NA';

            try {
              let data = {
                logid: logid,
                qrid: qrid,
                qrurl: qrurl,
                marketid: marketID,
                request_host: request_host,
                request_origin: request_origin,
                request_useragent: request_useragent,
                logdatetime: logdatetime,
                qrtype: qrtype,
                qrlogid: qrlogid,
                user_email: user_email,
                location: location,
              };
              //add to QRCount
              models.FoodprintQrcount.create(data)
                .then(() => {
                  console.log('Product Attribute Scan Successful');
                })
                .catch(err => {
                  console.error('Product Attribute scan error');
                });
            } catch (e) {
              console.error('Market checkin tracking error occured');
              res.render('error', {
                message: 'Cannot access resources for page.',
                title: 'Error',
                user: req.user,
                filter_data: '',
                qrcodedata: '',
                page_name: 'error',
              });
            }

            res.render('qrcode_product', {
              page_title: 'FoodPrint - QR Code Product',
              product_data: rows,
              qrdata: req.params.qrid,
              user: req.user,
              qrcode_data: qrcoderows,
              filter_data: '',
              page_name: 'qrcode_product',
            });
          })
        )
        .catch(err => {
          console.log('All qrcode_product err:' + err);
          req.flash('error', err);
          res.render('qrcode_product', {
            page_title: 'FoodPrint - QR Code Product',
            product_data: '',
            qrdata: '',
            qrcode_data: '',
            filter_data: '',
            user: req.user,
            page_name: 'qrcode_product',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        filter_data: '',
        qrcodedata: '',
        page_name: 'error',
      });
    }
  }
);

//Render qrcode analytics EJS
router.get(
  '/qrcode/analytics',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintQrcount.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'dashboard_qrcode_scans',
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_scans err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_scans',
          });
        });
    } else if (req.user.role !== ROLES.Admin) {
      models.FoodprintQrcount.findAll({
        where: {
          user_email: req.user.email,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: rows,
            user: req.user,
            filter_data: '',
            page_name: 'dashboard_qrcode_scans',
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_scans err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_scans',
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

//Render filtered qrcode analytics EJS
router.get(
  '/qrcode/analytics/filter/:qrtype',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintQrcount.findAll({
        where: {
          qrtype: req.params.qrtype,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: rows,
            user: req.user,
            filter_data: req.params.qrtype,
            page_name: 'dashboard_qrcode_scans',
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_scans err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_scans',
          });
        });
    } else if (req.user.role !== ROLES.Admin) {
      models.FoodprintQrcount.findAll({
        where: {
          user_email: req.user.email,
          qrtype: req.params.qrtype,
        },
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: rows,
            user: req.user,
            filter_data: req.params.qrtype,
            page_name: 'dashboard_qrcode_scans',
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_scans err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_scans', {
            page_title: 'FoodPrint - QR Code Analytics Dashboard',
            data: '',
            filter_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_scans',
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

//Render qrcode EJS
router.get(
  '/qrcode/supplierproduce',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintStorage.findAll({
        order: [['pk', 'DESC']],
      })
        .then(async rows => {
          //create array of URL data
          const qrcodes = [];
          const supplier_shortcode_list_check1 = [];
          for (var i = 0; i < rows.length; i++) {
            //check if the url exists and not duplicate else dont create
            if (
              rows[i].qrcode_url &&
              !supplier_shortcode_list_check1.includes(rows[i].supplierproduce) &&
              rows[i].market_Shortcode
            ) {
              supplier_shortcode_list_check1.push(rows[i].supplierproduce);
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
          console.log(supplier_shortcode_list_check1);
          models.FoodprintHarvest.findAll({
            order: [['pk', 'DESC']],
          }).then(async harvest_rows => {
            const harvest_data = [];
            const supplier_shortcode_list_check2 = [];
            //loop through harvest with storage.logid
            for (var i = 0; i < rows.length; i++) {
              var keyToFind = rows[i].harvest_logid;
              for (var k in harvest_rows) {
                //find key and add data to dict
                if (harvest_rows[k].harvest_logid == keyToFind) {
                  //checks to stop whatsapp entries that dont have enough data (farm name)
                  if (
                    harvest_rows[k].harvest_supplierShortcode &&
                    harvest_rows[k].harvest_supplierName &&
                    rows[i].qrcode_url
                  ) {
                    let qrcode_title =
                      harvest_rows[k].harvest_supplierShortcode +
                      ' ' +
                      harvest_rows[k].harvest_produceName;
                    let harvest_farm_name = harvest_rows[k].harvest_supplierName;
                    let harvest_produce_name = harvest_rows[k].harvest_produceName;

                    var harv_data = {
                      qrcode_title: qrcode_title,
                      harvest_farm_name: harvest_farm_name,
                      harvest_produce_name: harvest_produce_name,
                    };
                    //console.log(harv_data.qrcode_title);
                    //check if suppliershortcode list doesnt contains shortcode add it and push dict to array
                    if (!supplier_shortcode_list_check2.includes(harv_data.qrcode_title)) {
                      supplier_shortcode_list_check2.push(harv_data.qrcode_title);
                      harvest_data.push(harv_data);
                    }
                  }
                  break;
                }
              }
            }
            console.log(harvest_data);

            res.render('dashboard_qrcode_supplier', {
              page_title: 'FoodPrint - QR Code Dashboard',
              data: rows,
              user: req.user,
              qrcodes: qrcodes,
              harvest_data: harvest_data,
              filter_data: '',
              page_name: 'dashboard_qrcode_supplier',
            });
          });
        })
        .catch(err => {
          console.log('All dashboard_qrcode_supplier err:' + err);
          req.flash('error', err);
          res.render('dashboard_qrcode_supplier', {
            page_title: 'FoodPrint - QR Code Dashboard',
            data: '',
            filter_data: '',
            harvest_data: '',
            user: req.user,
            page_name: 'dashboard_qrcode_supplier',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        filter_data: '',
        harvest_data: '',
        page_name: 'error',
      });
    }
  }
);

module.exports = router;
