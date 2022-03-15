var express = require('express');
const { check, validationResult, sanitizeParam } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
var router = express.Router();
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
const CUSTOM_ENUMS = require('../utils/enums');
const uuidv4 = require('uuid/v4');

var models = initModels(sequelise);

//trace_produce
router.get(
  '/app/trace_produce',
  require('connect-ensure-login').ensureLoggedIn({
    redirectTo: '/app/auth/login',
  }),
  function (req, res) {
    res.render('trace_produce', { user: req.user, page_name: 'trace_produce' });
  }
);

//blockchain_explorer
router.get(
  '/app/blockchain_explorer',
  require('connect-ensure-login').ensureLoggedIn({
    redirectTo: '/app/auth/login',
  }),
  function (req, res) {
    res.render('blockchain_explorer', {
      user: req.user,
      page_name: 'blockchain_explorer',
    });
  }
);

//traceproduce (i.e. produce search) XmlHTTP request
router.post(
  '/app/traceproduce',
  [check('search_term', 'Search term is not valid').not().isEmpty().trim().escape()],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array(), success: false });
    } else {
      try {
        models.FoodprintStorage.findAll({
          attributes: [
            'harvest_logid',
            'storage_logid',
            'market_storageTimeStamp',
            'supplierproduce',
          ],
          where: {
            [Op.or]: [
              { storage_logid: req.body.search_term },
              { harvest_logid: req.body.search_term },
              {
                supplierproduce: {
                  [Op.substring]: req.body.search_term,
                },
              },
              { supplierproduce: req.body.search_term },
            ],
          },
        })
          .then(storage_rows => {
            models.FoodprintHarvest.findAll({
              attributes: [
                'harvest_logid',
                'supplierproduce',
                'harvest_quantity',
                'harvest_unitofmeasure',
                'harvest_TimeStamp',
              ],
              where: {
                [Op.or]: [
                  { harvest_logid: req.body.search_term },
                  { harvest_produceName: req.body.search_term },
                  {
                    supplierproduce: {
                      [Op.substring]: req.body.search_term,
                    },
                  },
                  { supplierproduce: req.body.search_term },
                ],
              },
            })
              .then(harvest_rows => {
                console.log('Search DB success');
                res.json({
                  success: true,
                  produce_harvest_data: harvest_rows,
                  produce_storage_data: storage_rows,
                });
              })
              .catch(err => {
                console.error('error', err);
                res.status.json({ err: err });
              });
          })
          .catch(err => {
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

module.exports = router;
