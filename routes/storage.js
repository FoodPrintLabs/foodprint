var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')
var body = require('express-validator'); //validation
var moment = require('moment'); //datetime
var connection  = require('../src/js/db');
var ROLES = require('../utils/roles');


/* GET storage page. */
router.get('/',
    require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
    function(req, res, next){
        if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            connection.query('SELECT * FROM foodprint_storage ORDER BY pk desc',function(err,rows)     {
                if(err){
                     req.flash('error', err);
                     res.render('storagelogbook',{  page_title:"FoodPrint - Storage Logbook", 
                                            data:'', user: req.user, page_name:'storagelogbook' });
                }else{
                    res.render('storagelogbook',{   page_title:"FoodPrint - Storage Logbook", 
                                            data:rows, user: req.user,
                                            page_name:'storagelogbook' });
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
    //System populated:
    //viewmodal_harvest_added_to_blockchain_date, viewmodal_harvest_capturetime, 
    //viewmodal_logdatetime, viewmodal_lastmodifieddatetime and viewmodal_harvest_logid,
    //viewmodal_harvest_blockchainhashid, viewmodal_harvest_blockchainhashdata,
    //viewmodal_harvest_bool_added_to_blockchain , 
    //viewmodal_harvest_user, viewmodal_harvest_blockchain_uuid, viewmodal_harvest_added_to_blockchain_by

    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_suppliername', 'Harvest Supplier Name is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_supplieraddress', 'Harvest Supplier Address value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_producename', 'Harvest Produce Name value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    //check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_logid', 'Storage ID value is not valid').not().isEmpty().trim().escape(),
  ],
    function(req, res){
        const result = validationResult(req);
        var errors = result.errors;
        for (var key in errors) {
            console.log('Validation error - ' + errors[key].msg);
      }
          if (!result.isEmpty()) {
              req.flash('error', errors);
              res.redirect('/app/storage');
            }
          else {
              //console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
              let harvest_logid_uuid = uuidv4()
              let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format("YYYY-MM-DD HH:mm:ss"); //actual time of harvest in the field 
              let harvest_CaptureTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss"); //time of harvest data entry 
              let logdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              let lastmodifieddatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");


              let data = {
                harvest_logid: harvest_logid_uuid,
                harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
                harvest_supplierName: req.body.viewmodal_harvest_suppliername, 
                harvest_farmerName: req.body.viewmodal_harvest_farmername,
                harvest_supplierAddress: req.body.viewmodal_harvest_supplieraddress,
                harvest_produceName: req.body.viewmodal_harvest_producename,
                harvest_photoHash: req.body.viewmodal_harvest_photohash,
                harvest_TimeStamp: harvest_TimeStamp,
                harvest_CaptureTime: harvest_CaptureTime,
                harvest_Description: req.body.viewmodal_harvest_description,
                harvest_geolocation: req.body.viewmodal_harvest_geolocation,
                harvest_quantity: req.body.viewmodal_harvest_quantity,
                harvest_unitOfMeasure: req.body.viewmodal_harvest_unitofmeasure,
                harvest_description_json: '-',
                harvest_BlockchainHashID: '-',
                harvest_BlockchainHashData: '-', 
                supplierproduce: req.body.viewmodal_supplierproduce, // e.g. WMPN_BabyMarrow
                harvest_bool_added_to_blockchain: 'false', //true or false
                harvest_added_to_blockchain_date: '-', //system generated when add to blockchain is selected
                harvest_added_to_blockchain_by: '-', // user who logged harvest to blockchain
                harvest_blockchain_uuid: '-', // uuid to blockchain config record which has contract and address
                harvest_user: req.user.email, // user who logged harvest
                logdatetime: logdatetime,
                lastmodifieddatetime: lastmodifieddatetime
              };
              let sql = "INSERT INTO foodprint_storage SET ?";
              try {
                  connection.query(sql, data, function(err, results) {
                      if(err) {
                          //throw err;
                          req.flash('error', err)
                          // redirect to Storage Logbook page
                          res.redirect('/app/storage')
                      } else{
                          req.flash('success', 'New Storage entry added successfully! Storage ID = ' + harvest_logid_uuid);
                          res.redirect('/app/storage');
                      }
                  });
                  } catch (e) {
                      //this will eventually be handled by your error handling middleware
                        next(e);
                        //res.json({success: false, errors:errors.array()});
                        console.log('Error - error handling middleware');

                        if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
                            connection.query('SELECT * FROM foodprint_storage ORDER BY pk desc',function(err,rows)     {
                                if(err){
                                    req.flash('error', err.message);
                                    res.render('storagelogbook',{  page_title:"FoodPrint - Storage Logbook", 
                                                            data:'', user: req.user, page_name:'storagelogbook',
                                                            success: false, errors: e.array(), });
                                }else{
                                    res.render('storagelogbook',{page_title:"FoodPrint - Storage Logbook", 
                                                            success: false, errors: e.array(),
                                                            data:rows, user: req.user,
                                                            page_name:'storagelogbook' });
                                }
                            });
                        }
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
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
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
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    check('viewmodal_harvest_logid', 'Storage ID value is not valid').not().isEmpty().trim().escape(),
  ], function(req, res) {
    const result = validationResult(req);
        var errors = result.errors;
        for (var key in errors) {
            console.log('Validation error - ' + errors[key].msg);
      }
       if (!result.isEmpty()) {
              //console.log('Error - !result.isEmpty');
              //console.log(errors);
               req.flash('error', errors)
                res.redirect('/app/storage') 
        }
          else {
            console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
            let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format("YYYY-MM-DD HH:mm:ss");
            let harvest_CaptureTime = moment(new Date(req.body.viewmodal_harvest_capturetime)).format("YYYY-MM-DD HH:mm:ss");
            let logdatetime = moment(new Date(req.body.viewmodal_logdatetime)).format("YYYY-MM-DD HH:mm:ss");
            let lastmodifieddatetime = moment(new Date(req.body.viewmodal_lastmodifieddatetime)).format("YYYY-MM-DD HH:mm:ss");
            //TODO - should rather update only the fields have changed!
                let sql = "UPDATE foodprint_storage SET harvest_supplierShortcode='" + req.body.viewmodal_harvest_suppliershortcode + "', " +
                  "harvest_supplierName='" + req.body.viewmodal_harvest_suppliername + 
                  "',harvest_farmerName='" + req.body.viewmodal_harvest_farmername +
                  "',harvest_supplierAddress='" + req.body.viewmodal_harvest_supplieraddress +
                  "',harvest_produceName='" + req.body.viewmodal_harvest_producename +
                  "',harvest_photoHash='" + req.body.viewmodal_harvest_photohash +
                  "',harvest_TimeStamp='" + req.body.viewmodal_harvest_timestamp +
                  "',harvest_CaptureTime='" + req.body.viewmodal_harvest_capturetime +
                  "',harvest_Description='" + req.body.viewmodal_harvest_description +
                  "',harvest_geolocation='" + req.body.viewmodal_harvest_geolocation +
                  "',harvest_quantity='" + req.body.viewmodal_harvest_quantity +
                  "',harvest_unitOfMeasure='" + req.body.viewmodal_harvest_unitofmeasure +
                  "',harvest_description_json='" + req.body.viewmodal_harvest_description_json +
                  "',harvest_BlockchainHashID='" + req.body.viewmodal_harvest_blockchainhashid +
                  "',harvest_BlockchainHashData='" + req.body.viewmodal_harvest_blockchainhashdata +
                  "',supplierproduce='" + req.body.viewmodal_supplierproduce +
                  "',harvest_bool_added_to_blockchain='" + req.body.viewmodal_harvest_bool_added_to_blockchain +
                  "',harvest_added_to_blockchain_date='" + req.body.viewmodal_harvest_added_to_blockchain_date +
                  "',harvest_added_to_blockchain_by='" + req.body.viewmodal_harvest_added_to_blockchain_by +
                  "',harvest_blockchain_uuid='" + req.body.viewmodal_harvest_blockchain_uuid +
                  "',harvest_user='" + req.body.viewmodal_harvest_user +
                  "',logdatetime='" + logdatetime +
                  "',lastmodifieddatetime='" + lastmodifieddatetime +
                  "' WHERE harvest_logid='" + req.body.viewmodal_harvest_logid + "'";
              console.log('sql ' + sql);
              //console.log('configid ' + req.body.config_id);
              try {
                  connection.query(sql, function(err, results){
                      if(err) {
                          //throw err;
                          console.log('Error - Update Harvest failed');
                          console.log(err);
                          req.flash('error', err.message)
                          // redirect to Storage Logbook page
                          res.redirect('/app/storage')
                      } 
                      else{
                          req.flash('success', 'Storage entry updated successfully! Storage ID = ' + req.body.viewmodal_harvest_logid);
                          res.redirect('/app/storage');
                        }
              })
                  ;
              } catch (e) {
                  //this will eventually be handled by your error handling middleware
                  next(e);
                  //res.json({success: false, errors:errors.array()});
                  console.log('Error - error handling middleware');

                  if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
                    connection.query('SELECT * FROM foodprint_storage ORDER BY pk desc',function(err,rows)     {
                        if(err){
                             req.flash('error', err.message);
                             res.render('storagelogbook',{  page_title:"FoodPrint - Storage Logbook", 
                                                    data:'', user: req.user, page_name:'storagelogbook',
                                                    success: false, errors: e.array(), });
                        }else{
                            res.render('storagelogbook',{page_title:"FoodPrint - Storage Logbook", 
                                                    success: false, errors: e.array(),
                                                    data:rows, user: req.user,
                                                    page_name:'storagelogbook' });
                        }
                     });
                  }
              }
          }
    });

//route for delete data
//TODO - should we add a deleted field and rather set that to 1 instead of an actual delete?
router.post('/delete',
    [
    check('viewmodal_harvest_logid', 'Storage ID value is not valid').not().isEmpty().trim().escape(),
  ],
  function(req, res) {
    let sql = "DELETE FROM foodprint_storage WHERE harvest_logid='"+req.body.viewmodal_harvest_logid+"'";
    console.log('sql ' + sql);
    // console.log('configname ' + req.body.config_name2);
    console.log('configid ' + req.body.viewmodal_harvest_logid);
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            let query = connection.query(sql, (err, results) => {
                if(err) {
                    //throw err;
                    req.flash('error', err.message)
                    // redirect to Storage Logbook page
                    res.redirect('/app/storage')
                } else{
                    req.flash('success', 'Storage entry deleted successfully! Storage ID = ' + req.body.viewmodal_harvest_logid);
                    res.redirect('/app/storage');
                }
            });
        }
    });

 
module.exports = router;