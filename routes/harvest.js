var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')
var body = require('express-validator'); //validation
var connection  = require('../src/js/db');
var ROLES = require('../utils/roles');


/* GET harvest page. */
router.get('/',
    require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
    function(req, res, next){
        if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            connection.query('SELECT * FROM foodprint_harvest ORDER BY pk desc',function(err,rows)     {
                if(err){
                     req.flash('error', err);
                     res.render('harvestlogbook',{  page_title:"FoodPrint - Harvest Logbook", 
                                            data:'', user: req.user, page_name:'harvestlogbook' });
                }else{
                    res.render('harvestlogbook',{   page_title:"FoodPrint - Harvest Logbook", 
                                            data:rows, user: req.user,
                                            page_name:'harvestlogbook' });
                }
             });
          }else{
            res.render('error',{    message: 'You are not authorised to view this resource.', 
                                    title: 'Error', user: req.user,
                                    page_name:'error' });
          }
    });

//route for insert data
router.post('/save', [
    //check('sample_name').not().isEmpty().withMessage('Name must have more than 5 characters'),
    //check('sample_classYear', 'Class Year should be a number').not().isEmpty(),
    //check('weekday', 'Choose a weekday').optional(),
    check('config_name', 'Your config name is not valid').not().isEmpty().trim().escape(),
    check('config_description', 'Your config description is not valid').not().isEmpty().trim().escape(),
    check('config_value', 'Your config value is not valid').not().isEmpty().trim().escape(),
  ],
    function(req, res){
        const result = validationResult(req);
        var errors = result.errors;
        for (var key in errors) {
            console.log('Validation error - ' + errors[key].msg);
      }
          if (!result.isEmpty()) {
              req.flash('error', errors);
              res.redirect('/app/harvest');
            }
          else {
              let config_datetime = new Date();
              let config_uuid = uuidv4()
              let data = {
                  configname: req.body.config_name, configdescription: req.body.config_description,
                  configvalue: req.body.config_value, logdatetime: config_datetime, configid: config_uuid
              };
              let sql = "INSERT INTO foodprint_harvest SET ?";
              try {
                  connection.query(sql, data, function(err, results) {
                      if(err) {
                          //throw err;
                          req.flash('error', err)
                          // redirect to harvest logbook page
                          res.redirect('/app/harvest')
                      } else{
                          req.flash('success', 'New Harvestentry added successfully! Harvest Name = ' + req.body.config_name);
                          res.redirect('/app/harvest');
                      }
                  });
                  } catch (e) {
                      //this will eventually be handled by your error handling middleware
                      next(e);
                      //res.json({success: false, errors: e});
                    res.render('harvestlogbook',{page_title:"FoodPrint - Harvest Logbook", data:'',
                                                success: false, errors:e.array(),
                                                page_name:'harvestlogbook',
                                                user: req.user,});
                  }
          }
    });

//route for update data
router.post('/update', [
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_suppliername', 'Harvest Supplier Name is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_supplieraddress', 'Harvest Supplier Address value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_producename', 'Harvest Produce Name value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
  ], function(req, res) {
    const result = validationResult(req);
        var errors = result.errors;
        for (var key in errors) {
            console.log('Validation error - ' + errors[key].msg);
      }
       if (!result.isEmpty()) {
              console.log('Error - !result.isEmpty');
              console.log(errors);
               req.flash('error', errors)
                res.redirect('/app/harvest') 
        }
          else {
              let sql = "UPDATE foodprint_harvest SET configname='" + req.body.config_name + "', " +
                  "configdescription='" + req.body.config_description + "',configvalue='" + req.body.config_value +
                  "' WHERE configid='" + req.body.config_id + "'";
              console.log('sql ' + sql);
              //console.log('configid ' + req.body.config_id);
              try {
                  connection.query(sql, function(err, results){
                      if(err) {
                          //throw err;
                          console.log('Error - Update Harvest failed');
                          console.log(err);
                          req.flash('error', err.message)
                          // redirect to harvest logbook page
                          res.redirect('/app/harvest')
                      } else{
                          req.flash('success', 'Harvest entry updated successfully! Config Name = ' + req.body.config_name);
                  res.redirect('/app/harvest');
              }
              })
                  ;
              } catch (e) {
                  //this will eventually be handled by your error handling middleware
                  next(e);
                  //res.json({success: false, errors:errors.array()});
                  console.log('Error - error handling middleware');

                  if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
                    connection.query('SELECT * FROM foodprint_harvest ORDER BY pk desc',function(err,rows)     {
                        if(err){
                             req.flash('error', err.message);
                             res.render('harvestlogbook',{  page_title:"FoodPrint - Harvest Logbook", 
                                                    data:'', user: req.user, page_name:'harvestlogbook',
                                                    success: false, errors: e.array(), });
                        }else{
                            res.render('harvestlogbook',{page_title:"FoodPrint - Harvest Logbook", 
                                                    success: false, errors: e.array(),
                                                    data:rows, user: req.user,
                                                    page_name:'harvestlogbook' });
                        }
                     });
                  }
              }
          }
    });

//route for delete data
router.post('/delete',(req, res) => {
  let sql = "DELETE FROM foodprint_harvest WHERE configid='"+req.body.config_id2+"'";
  // console.log('sql ' + sql);
  // console.log('configname ' + req.body.config_name2);
  // console.log('configid ' + req.body.config_id2);
  let query = connection.query(sql, (err, results) => {
    if(err) {
        //throw err;
        req.flash('error', err.message)
        // redirect to harvest logbook page
        res.redirect('/app/harvest')
    } else{
        req.flash('success', 'Harvest deleted successfully! Harvest Name = ' + req.body.config_name2);
        res.redirect('/app/harvest');
      }
  });
});

 
module.exports = router;