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
    //System populated items commented out and excluded from validation
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', ' Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Shortcode', 'Market Shortcode value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Name', 'Market Name value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Address', 'Market Address value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_quantity', 'Storage Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_unitOfMeasure', 'Storage Unit of Measure value  is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_storageTimeStamp', 'Storage Timestamp value is not valid').not().isEmpty(),
    //check('viewmodal_market_storageCaptureTime', 'Storage Capture Time is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_storage_BlockchainHashID', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_storage_BlockchainHashData', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_Description', 'Storage Description value is not valid').not().isEmpty().trim().escape(),
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
              let harvest_logid_uuid = uuidv4(); //TODO - this should be selected in Storage Modal via drop down
              let storage_logid_uuid = uuidv4();
              let storage_TimeStamp = moment(new Date(req.body.viewmodal_market_storageTimeStamp)).format("YYYY-MM-DD HH:mm:ss"); //actual time of storage/handover at market with farmer 
              let storage_CaptureTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss"); //time of storage/handover data entry 
              let logdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              let lastmodifieddatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

              let data = {
                harvest_logid: harvest_logid_uuid,
                storage_logid: storage_logid_uuid,
                harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
                supplierproduce: req.body.viewmodal_supplierproduce, // e.g. WMPN_BabyMarrow
                market_Shortcode: req.body.viewmodal_market_Shortcode,
                market_Name: req.body.viewmodal_market_Name,
                market_Address: req.body.viewmodal_market_Address,
                market_quantity: req.body.viewmodal_market_quantity,
                market_unitOfMeasure: req.body.viewmodal_market_unitOfMeasure,
                market_storageTimeStamp: storage_TimeStamp,
                market_storageCaptureTime: storage_CaptureTime,
                market_URL: req.body.viewmodal_market_URL,
                storage_BlockchainHashID: '-',
                storage_BlockchainHashData: '-',
                storage_Description: req.body.viewmodal_storage_Description,
                storage_bool_added_to_blockchain: 'false', //true or false
                storage_added_to_blockchain_date: '-',  //system generated when add to blockchain is selected
                storage_added_to_blockchain_by: '-', // user who logged storage to blockchain
                storage_blockchain_uuid: '-', // uuid to blockchain config record which has contract and address
                storage_user: req.user.email, // user who logged storage
                logdatetime: logdatetime,
                lastmodifieddatetime: lastmodifieddatetime
              };
              console.log('storage_TimeStamp - ' + storage_TimeStamp);
              console.log('viewmodal_market_storageTimeStamp - ' + req.body.viewmodal_market_storageTimeStamp);


              let sql = "INSERT INTO foodprint_storage SET ?";
              try {
                  connection.query(sql, data, function(err, results) {
                      if(err) {
                          //throw err;
                          req.flash('error', err)
                          // redirect to Storage Logbook page
                          res.redirect('/app/storage')
                      } else{
                          req.flash('success', 'New Storage entry added successfully! Storage ID = ' + storage_logid_uuid);
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
    //System populated items commented out and excluded from validation
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', ' Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Shortcode', 'Market Shortcode value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Name', 'Market Name value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_Address', 'Market Address value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_quantity', 'Storage Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_unitOfMeasure', 'Storage Unit of Measure value  is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_market_storageTimeStamp', 'Storage Timestamp value is not valid').not().isEmpty(),
    check('viewmodal_market_storageCaptureTime', 'Storage Capture Time is not valid').not().isEmpty(),
    check('viewmodal_market_URL', 'Market URL value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_BlockchainHashID', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_BlockchainHashData', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_Description', 'Storage Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_added_to_blockchain_date', 'Storage Added to Blockchain Date is not valid').not().isEmpty(),
    check('viewmodal_storage_added_to_blockchain_by', 'Storage Added to Blockchain by is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_blockchain_uuid', 'Storage Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_storage_user', 'Sorage User  value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not(),
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().escape(),
    check('viewmodal_storage_logid', 'Storage ID value is not valid').not().isEmpty().escape(),
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
            let storage_TimeStamp = moment(new Date(req.body.viewmodal_market_storageTimeStamp)).format("YYYY-MM-DD HH:mm:ss");
            let storage_CaptureTime = moment(new Date(req.body.viewmodal_market_storageCaptureTime)).format("YYYY-MM-DD HH:mm:ss");
            let logdatetime = moment(new Date(req.body.viewmodal_logdatetime)).format("YYYY-MM-DD HH:mm:ss");
            let lastmodifieddatetime = moment(new Date(req.body.viewmodal_lastmodifieddatetime)).format("YYYY-MM-DD HH:mm:ss");
            //TODO - should rather update only the fields have changed!
                let sql = "UPDATE foodprint_storage SET harvest_logid='" + req.body.viewmodal_harvest_logid + "', " +
                  "harvest_supplierShortcode='" + req.body.viewmodal_harvest_suppliershortcode + 
                  "',supplierproduce='" + req.body.viewmodal_supplierproduce + 
                  "',market_Shortcode='" + req.body.viewmodal_market_Shortcode + 
                  "',market_Name='" + req.body.viewmodal_market_Name + 
                  "',market_Address='" + req.body.viewmodal_market_Address + 
                  "',market_quantity='" + req.body.viewmodal_market_quantity + 
                  "',market_unitOfMeasure='" + req.body.viewmodal_market_unitOfMeasure + 
                  "',market_storageTimeStamp='" + storage_TimeStamp + 
                  "',market_storageCaptureTime='" + storage_CaptureTime + 
                  "',market_URL='" + req.body.viewmodal_market_URL + 
                  "',storage_BlockchainHashID='" + req.body.viewmodal_storage_BlockchainHashID + 
                  "',storage_BlockchainHashData='" + req.body.viewmodal_storage_BlockchainHashData + 
                  "',storage_Description='" + req.body.viewmodal_storage_Description + 
                  "',storage_bool_added_to_blockchain='" + req.body.viewmodal_storage_bool_added_to_blockchain + 
                  "',storage_added_to_blockchain_date='" + req.body.viewmodal_storage_added_to_blockchain_date + 
                  "',storage_added_to_blockchain_by='" + req.body.viewmodal_storage_added_to_blockchain_by + 
                  "',storage_blockchain_uuid='" + req.body.viewmodal_storage_blockchain_uuid + 
                  "',storage_user='" + req.body.viewmodal_storage_user +
                  "',logdatetime='" + logdatetime +
                  "',lastmodifieddatetime='" + lastmodifieddatetime +
                  "' WHERE storage_logid='" + req.body.viewmodal_storage_logid + "'";
              console.log('sql ' + sql);
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
                          req.flash('success', 'Storage entry updated successfully! Storage ID = ' + req.body.viewmodal_storage_logid);
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
    check('viewmodal_storage_logid', 'Storage ID value is not valid').not().isEmpty().trim().escape(),
  ],
  function(req, res) {
    let sql = "DELETE FROM foodprint_storage WHERE storage_logid='"+req.body.viewmodal_storage_logid+"'";
    //console.log('sql ' + sql);
    console.log('configid ' + req.body.viewmodal_storage_logid);
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            let query = connection.query(sql, (err, results) => {
                if(err) {
                    //throw err;
                    req.flash('error', err.message)
                    // redirect to Storage Logbook page
                    res.redirect('/app/storage')
                } else{
                    req.flash('success', 'Storage entry deleted successfully! Storage ID = ' + req.body.viewmodal_storage_logid);
                    res.redirect('/app/storage');
                }
            });
        }
    });

 
module.exports = router;