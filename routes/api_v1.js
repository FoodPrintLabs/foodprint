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
let passport = require('passport');

/**
 * @swagger
 * components:
 *  schemas:
 *    Harvest:
 *      type: object
 *      required:
 *        - harvest_logid
 *        - harvest_supplierShortcode
 *        - harvest_supplierName
 *        - supplierproduce
 *        - harvest_produceName
 *        - harvest_supplierAddress
 *        - harvest_farmerName
 *        - harvest_timestamp
 *        - harvest_capturetime
 *        - harvest_description
 *        - harvest_geolocation
 *        - harvest_quantity
 *        - harvest_unitofmeasure
 *      properties:
 *        harvest_logid:
 *          type: string
 *        harvest_supplierShortcode:
 *          type: string
 *        harvest_supplierName:
 *          type: string
 *        supplierproduce:
 *          type: string
 *        harvest_produceName:
 *          type: string
 *        harvest_supplierAddress:
 *          type: string
 *        harvest_farmerName:
 *          type: string
 *        harvest_year_established:
 *          type: string
 *        harvest_covid19_response:
 *          type: string
 *        harvest_timestamp:
 *          type: string
 *        harvest_capturetime:
 *          type: string
 *        harvest_description:
 *          type: string
 *        harvest_geolocation:
 *          type: string
 *        harvest_quantity:
 *          type: string
 *        harvest_unitofmeasure:
 *          type: string
 *        harvest_blockchainhashid:
 *          type: string
 *        harvest_blockchainhashdata:
 *          type: string
 *        harvest_bool_added_to_blockchain:
 *          type: string
 *        harvest_added_to_blockchain_date:
 *          type: string
 *        harvest_added_to_blockchain_by:
 *          type: string
 *        harvest_blockchain_uuid:
 *          type: string
 *        harvest_user:
 *          type: string
 *        logdatetime:
 *          type: string
 *        lastmodifieddatetime:
 *          type: string
 *      example:
 *        harvest_supplierShortcode: OZCF
 *        harvest_supplierName: Oranjezicht City Farm
 *        supplierproduce: OZCF_Beetroot
 *        harvest_produceName: Beetroot
 *        harvest_supplierAddress: 37 Test Street, Goodwood
 *        harvest_farmerName: Oranjezicht City Farm
 *        harvest_year_established:
 *        harvest_covid19_response:
 *        harvest_timestamp: 01/17/2022 9:25 AM
 *        harvest_capturetime: 01/17/2022 9:25 AM
 *        harvest_description: Good quality Beetroot
 *        harvest_geolocation: Cape Town
 *        harvest_quantity: 50
 *        harvest_unitofmeasure: kilogram
 *        harvest_blockchainhashid:
 *        harvest_blockchainhashdata:
 *        harvest_bool_added_to_blockchain: false
 *        harvest_added_to_blockchain_date:
 *        harvest_added_to_blockchain_by:
 *        harvest_blockchain_uuid:
 *        harvest_user: superuserjulz@example.com
 *        logdatetime: 01/23/2022 9:25 AM
 *        lastmodifieddatetime: 01/23/2022 9:25 AM
 *    Storage:
 *       type: object
 *       required:
 *         - harvest_logid
 *         - harvest_supplierShortcode
 *         - supplierproduce
 *         - market_Shortcode
 *         - market_Name
 *         - market_Address
 *         - market_quantity
 *         - market_unitOfMeasure
 *         - market_storageTimeStamp
 *         - market_storageCaptureTime
 *         - market_URL
 *         - storage_Description
 *       properties:
 *          harvest_logid:
 *            type: string
 *          harvest_supplierShortcode:
 *            type: string
 *          supplierproduce:
 *            type: string
 *          market_Shortcode:
 *            type: string
 *          market_Name:
 *            type: string
 *          market_Address:
 *            type: string
 *          market_quantity:
 *            type: string
 *          market_unitOfMeasure:
 *            type: string
 *          market_storageTimeStamp:
 *            type: string
 *          market_storageCaptureTime:
 *            type: string
 *          market_URL:
 *            type: string
 *          storage_BlockchainHashID:
 *            type: string
 *          storage_BlockchainHashData:
 *            type: string
 *          storage_Description:
 *            type: string
 *          storage_bool_added_to_blockchain:
 *            type: string
 *          storage_added_to_blockchain_by:
 *            type: string
 *          storage_blockchain_uuid:
 *            type: string
 *          storage_user:
 *            type: string
 *          logdatetime:
 *            type: string
 *          lastmodifieddatetime:
 *            type: string
 *       example:
 *          harvest_logid: b0773049-a975-4a7b-af6c-f994c54ac53d
 *          harvest_supplierShortcode: OZCF
 *          supplierproduce: OZCF_Beetroot
 *          market_Shortcode: OZCFM
 *          market_Name: Oranjezicht City Farm Market
 *          market_Address: OZCFM Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051
 *          market_quantity: 50
 *          market_unitOfMeasure: kilogram
 *          market_storageTimeStamp: Sun Jan 23 2022 09:24:00 GMT 0200 (Central Africa Time)
 *          market_storageCaptureTime: Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)
 *          market_URL: testm.com
 *          storage_BlockchainHashID:
 *          storage_BlockchainHashData:
 *          storage_Description: good quality
 *          storage_bool_added_to_blockchain: false
 *          storage_added_to_blockchain_by:
 *          storage_blockchain_uuid:
 *          storage_user: superuserjulz@example.com
 *          logdatetime: Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)
 *          lastmodifieddatetime: Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)
 *  requestBodies:
 *    HarvestLogID:
 *      description: A JSON object containing the logid of a harvest entry
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              harvest_logid:
 *                type: string
 *                description: id of the harvest entry
 *                example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *    StorageLogID:
 *      description: A JSON object containing the logid of a storage entry
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              storage_logid:
 *                type: string
 *                description: id of the storage entry
 *                example: b0773049-a975-4a7b-af6c-f994c54ac53d
 */

/**
 * @swagger
 * tags:
 *  - name: Harvest
 *    description: Harvest API
 *  - name: Storage
 *    description: Storage API
 *  - name: QRCount
 *    description: QR Count API
 *  - name: Produce
 *    description: Produce API
 *  - name: Order
 *    description: Order, Bids & Offers API
 */

/**
 * @swagger
 * /app/api/v1/harvest:
 *  get:
 *    summary: Returns a list of all the harvest items
 *    tags: [Harvest]
 *    responses:
 *      200:
 *        description: The list of harvest items
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Harvest'
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
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

/**
 * @swagger
 * /app/api/v1/harvest/save:
 *  post:
 *    summary: Creates a new harvest entry in the database
 *    tags: [Harvest]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Harvest'
 *    responses:
 *      201:
 *        description: Harvest entry was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Harvest created successfully
 *                harvest_logid:
 *                  type: string
 *                  description: The UUID of the created harvest entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/harvest/update:
 *  post:
 *    summary: Updates harvest entry in the database
 *    tags: [Harvest]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Harvest'
 *    responses:
 *      200:
 *        description: Harvest entry was successfully updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Harvest entry updated successfully
 *                harvest_logid:
 *                  type: string
 *                  description: The UUID of the updated harvest entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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
      // console.log('req.body.harvest_logid ' + req.body.harvest_logid);
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

/**
 * @swagger
 * /app/api/v1/harvest/delete:
 *  post:
 *    summary: Deletes harvest entry from the database
 *    tags: [Harvest]
 *    requestBody:
 *      $ref: '#/components/requestBodies/HarvestLogID'
 *    responses:
 *      200:
 *        description: Harvest entry was successfully deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Harvest entry deleted successfully!
 *                harvest_logid:
 *                  type: string
 *                  description: The id of the deleted harvest entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/harvest/save/whatsapp:
 *  post:
 *    summary: Creates a new harvest entry in the database
 *    tags: [Harvest]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Harvest'
 *    responses:
 *      201:
 *        description: Harvest entry was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Harvest created successfully
 *                harvest_logid:
 *                  type: string
 *                  description: The UUID of the created harvest entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/harvest/whatsapp:
 *  post:
 *    summary: Returns harvest entry for the supplied harvest id
 *    tags: [Harvest]
 *    requestBody:
 *      $ref: '#/components/requestBodies/HarvestLogID'
 *    responses:
 *      200:
 *        description: The list of harvest items
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              example:
 *                - harvest_produceName: Beetroot
 *                  harvest_quantity: 60
 *                  harvest_unitOfMeasure: kilogram
 *                  logdatetime: 2022-01-23T07:25:00.000Z
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */
router.post('/harvest/whatsapp', function (req, res, next) {
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

/**
 * @swagger
 * /app/api/v1/storage:
 *  get:
 *    summary: Returns a list of all the storage items
 *    tags: [Storage]
 *    responses:
 *      200:
 *        description: The list of storage items
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Storage'
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
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

/**
 * @swagger
 * /app/api/v1/storage/save:
 *  post:
 *    summary: Creates a new storage entry in the database
 *    tags: [Storage]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Storage'
 *    responses:
 *      201:
 *        description: Storage entry was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: New Storage entry added successfully
 *                storage_logid:
 *                  type: string
 *                  description: The id of the created storage entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/storage/update:
 *  post:
 *    summary: Updates Storage entry in the database
 *    tags: [Storage]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Storage'
 *    responses:
 *      200:
 *        description: Storage entry was successfully updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Storage entry updated successfully
 *                storage_logid:
 *                  type: string
 *                  description: The id of the updated storage entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/storage/delete:
 *  post:
 *    summary: Deletes a storage entry from the database
 *    tags: [Storage]
 *    requestBody:
 *      $ref: '#/components/requestBodies/StorageLogID'
 *    responses:
 *      200:
 *        description: Storage entry was successfully deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Storage entry deleted successfully
 *                storage_logid:
 *                  type: string
 *                  description: The id of the deleted storage entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/storage/save/whatsapp:
 *  post:
 *    summary: Creates a new storage entry in the database
 *    tags: [Storage]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Storage'
 *    responses:
 *      201:
 *        description: Storage entry was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Success message
 *                  example: Storage entry created successfully
 *                storage_logid:
 *                  type: string
 *                  description: The id of the created storage entry
 *                  example: b0773049-a975-4a7b-af6c-f994c54ac53d
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: An error occurred
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: error object
 *                  message:
 *                    type: string
 *                    description: error message
 *                    example: Internal server error
 */
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

/**
 * @swagger
 * /app/api/v1/storage/whatsapp:
 *  post:
 *    summary: Returns a storage entry for the supplied storage id
 *    tags: [Storage]
 *    requestBody:
 *      $ref: '#/components/requestBodies/StorageLogID'
 *    responses:
 *      200:
 *        description: The list of storage items
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              example:
 *                - supplierproduce: OZCF_Beetroot
 *                  market_quantity: 60
 *                  market_unitOfMeasure: kilogram
 *                  logdatetime: 2022-01-23T09:24:46.000Z
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */
router.post('/storage/whatsapp', function (req, res, next) {
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

/**
 * @swagger
 * /app/api/v1/qrcount/scans/{startDate}:
 *    get:
 *      summary: Get a list of scanned QR Codes and scan count from the start date upto current date
 *      tags: [QRCount]
 *      parameters:
 *        - in: path
 *          name: startDate
 *          schema:
 *            type: string
 *            example: 2021-11-24
 *          required: true
 *          description: The start date to query the database against in the format yyyy-mm-dd
 *      responses:
 *        200:
 *          description: The list of scanned QR Codes with their respective scan count
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *        400:
 *           description: An error happened whilst querying the database
 *           content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    message:
 *                      type: string
 *                      description: Error message
 *                      example: An error occurred
 *        500:
 *          description: An internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: Error object
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: Internal server error
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

/**
 * @swagger
 * /app/api/v1/price:
 *  get:
 *    summary: Returns a list of all produce prices
 *    tags: [Produce]
 *    responses:
 *      200:
 *        description: The list of all produce prices
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Produce'
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */
/*
 * PRODUCE/PRICE
 */
router.get('/price', function (req, res) {
  try {
    models.FoodprintProducePrice.findAll({
      order: [['pk', 'DESC']],
    })
      .then(rows => {
        if (rows.length === 0) {
          res.status(200).json([]);
        } else {
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

/**
 * @swagger
 * /app/api/v1/offers:
 *  get:
 *    summary: Returns a list of all placed offers
 *    tags: [Order]
 *    responses:
 *      200:
 *        description: The list of offer items placed
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */
/*
 * ALL OFFERS REQUEST IN 2 WEEKS
 */
router.get('/offers', function (req, res) {
  try {
    //get range variables
    let current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let start_date = null;
    let finish_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    start_date = moment(current_date).subtract('2', 'weeks').format('YYYY-MM-DD HH:mm:ss');

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
    })
      .then(rows => {
        if (rows.length === 0) {
          res.status(200).json([]);
        } else {
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

/**
 * @swagger
 * /app/api/v1/bids:
 *  get:
 *    summary: Returns a list of all placed bids
 *    tags: [Order]
 *    responses:
 *      200:
 *        description: The list of bid items placed
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */
/*
 * ALL BID REQUEST IN 2 WEEKS
 */
router.get('/bids', function (req, res) {
  try {
    //get range variables
    let current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let start_date = null;
    let finish_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    start_date = moment(current_date).subtract('2', 'weeks').format('YYYY-MM-DD HH:mm:ss');

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
      .then(rows => {
        if (rows.length === 0) {
          res.status(200).json([]);
        } else {
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

module.exports = router;
