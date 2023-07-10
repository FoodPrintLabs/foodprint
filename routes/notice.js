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



/*
-- Noticeboard Logbook API
(a simple title, description, date and province)
Return the latest notices for current month.
 */

// Get All Notices

router.get(
    '/api/notices/',
    function (req, res, next) {
        //these are the only allowed roles to access the page
            // admins and superusers can see all records, whilst farmers can see only records they added

            models.FoodprintNotice.findAll()
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
    }
);

// Get Notice by Id

// Get a Notices for specified month

// Get notices by province

// Post a Notice

// Delete a Notice

// Update a Notice



module.exports = router;