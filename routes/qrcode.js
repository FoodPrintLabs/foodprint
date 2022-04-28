var express = require('express');
const { check, validationResult, sanitizeParam } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
var router = express.Router();
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const CUSTOM_ENUMS = require('../utils/enums');
const uuidv4 = require('uuid/v4');

var models = initModels(sequelise);

//market checkin XmlHTTP request
router.post(
  '/app/marketcheckin',
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
  '/app/checkin/:market_id',
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
router.get('/app/scan/:id', [sanitizeParam('id').escape().trim()], function (req, res) {
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel

  let weeklyViewQuery;
  let testProvenance;
  let baseAttributes = [
    'harvest_supplierShortcode',
    'harvest_supplierName',
    'harvest_farmerName',
    'year_established',
    'harvest_description_json',
    'harvest_photoHash',
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
        if (rows[0].harvest_photoHash === null) {
          rows[0].harvest_photoHash = '';
        } else {
          rows[0].harvest_photoHash =
            'data:image/png;base64,' +
            Buffer.from(rows[0].harvest_photoHash, 'binary').toString('base64');
        }
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
router.get('/app/api/v1/scan/:id', [sanitizeParam('id').escape().trim()], function (req, res) {
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel

  let weeklyViewQuery;
  let testProvenance;
  let baseAttributes = [
    'harvest_supplierShortcode',
    'harvest_supplierName',
    'harvest_farmerName',
    'year_established',
    'harvest_description_json',
    'harvest_photoHash',
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
        if (rows[0].harvest_photoHash === null) {
          rows[0].harvest_photoHash = '';
        } else {
          rows[0].harvest_photoHash =
            'data:image/png;base64,' +
            Buffer.from(rows[0].harvest_photoHash, 'binary').toString('base64');
        }
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

module.exports = router;
