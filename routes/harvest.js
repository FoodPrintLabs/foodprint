var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')
var body = require('express-validator'); //validation
var moment = require('moment'); //datetime
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files
const upload = multer({ dest: './static/images/produce_images/' });  //path.join(__dirname, 'static/images/produce_images/)
var connection  = require('../src/js/db');
var ROLES = require('../utils/roles');
var fs = require('fs');



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
                    for (i=0; i<rows.length; i++)
                    {
                        rows[i].harvest_photoHash = 'data:image/png;base64,' + new Buffer(rows[i].harvest_photoHash, 'binary').toString('base64');
                    }
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
router.post('/save', upload.single('viewmodal_harvest_photohash_uploaded_file'),
[
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
    //check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    //check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    //check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    //check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
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
              //console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
              let harvest_logid_uuid = uuidv4()
              let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format("YYYY-MM-DD HH:mm:ss"); //actual time of harvest in the field 
              let harvest_CaptureTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss"); //time of harvest data entry 
              let logdatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              let lastmodifieddatetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

              for (var harvest_description_item in req.body.viewmodal_harvest_description_json) {
                if (req.body.viewmodal_harvest_description_json) {
                  items = req.body.viewmodal_harvest_description_json;
                  harvest_description_item = JSON.stringify(items).replace(/]|[[]|"/g, '',)
                  console.log("items");
                  console.log(items);
                }
              }
              
              console.log("req.body.viewmodal_harvest_description_json");
              console.log(req.body.viewmodal_harvest_description_json);

              console.log("harvest_description_item");
              console.log(harvest_description_item);
              // req.file is the harvest image file i.e. viewmodal_harvest_photohash_uploaded_file
              const img = req.file; 
            
              // req.body will hold the text fields, if there were any
              // data is object-key-value pairs
              let data = {
                harvest_logid: harvest_logid_uuid,
                harvest_supplierShortcode: req.body.viewmodal_harvest_suppliershortcode,
                harvest_supplierName: req.body.viewmodal_harvest_suppliername, 
                harvest_farmerName: req.body.viewmodal_harvest_farmername,
                year_established: req.body.viewmodal_harvest_year_established,
                covid19_response: req.body.viewmodal_harvest_covid19_response,
                harvest_supplierAddress: req.body.viewmodal_harvest_supplieraddress,
                harvest_produceName: req.body.viewmodal_harvest_producename,
                //harvest_photoHash: req.body.viewmodal_harvest_photohash,
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
                lastmodifieddatetime: lastmodifieddatetime
              };
              let sql = "INSERT INTO foodprint_harvest SET ?";
              try {
                    fs.readFile(img.path, function(err, img_datadata) {
                        data['harvest_photoHash'] = img_datadata;
                        
                        connection.query(sql, data, function(err, results) {
                            if(err) {
                                //throw err;
                                req.flash('error', err.message)
                                // redirect to harvest logbook page
                                res.redirect('/app/harvest')
                            } else{
                                req.flash('success', 'New Harvest entry added successfully! Harvest ID = ' + harvest_logid_uuid);
                                res.redirect('/app/harvest');
                            }
                        });
                    });
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

//route for update data
router.post('/update',  upload.none(), [
    check('viewmodal_harvest_suppliershortcode', 'Harvest Supplier Shortcode is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_suppliername', 'Harvest Supplier Name is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_supplieraddress', 'Harvest Supplier Address value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_producename', 'Harvest Produce Name value is not valid').not().isEmpty().trim().escape(),
   // check('viewmodal_harvest_photohash', 'Harvest PhotoHash value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_timestamp', 'Harvest Timestamp value is not valid').not().isEmpty(),
    check('viewmodal_harvest_capturetime', 'Harvest Capture Time value is not valid').not().isEmpty(),
    check('viewmodal_harvest_description', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_geolocation', 'Harvest GeoLocation value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_quantity', 'Harvest Quantity value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_unitofmeasure', 'Harvest Unit of Measure value is not valid').not().isEmpty().trim().escape(),
    // check('viewmodal_harvest_description_json', 'Harvest Description value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchainhashid', 'Blockchain Hash ID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchainhashdata', 'Blockchain Hash Data value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_supplierproduce', 'Supplier Produce value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_bool_added_to_blockchain', 'Added to Blockchain value is not valid').not().isEmpty().trim().escape(),
   // check('viewmodal_harvest_added_to_blockchain_date', 'Harvest Added to Blockchain Date value is not valid').not().isEmpty(),
    check('viewmodal_harvest_added_to_blockchain_by', 'Harvest Added to Blockchain by value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_blockchain_uuid', 'Harvest Blockchain UUID value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_harvest_user', 'Harvest User value is not valid').not().isEmpty().trim().escape(),
    check('viewmodal_logdatetime', 'Logdatetime datetime value is not valid').not().isEmpty(),
    check('viewmodal_lastmodifieddatetime', 'Last Modified Datetime value is not valid').not().isEmpty(),
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
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
                res.redirect('/app/harvest') 
        }
          else {
            console.log('req.body.viewmodal_harvest_logid ' + req.body.viewmodal_harvest_logid);
            let harvest_TimeStamp = moment(new Date(req.body.viewmodal_harvest_timestamp)).format("YYYY-MM-DD HH:mm:ss");
            let harvest_CaptureTime = moment(new Date(req.body.viewmodal_harvest_capturetime)).format("YYYY-MM-DD HH:mm:ss");
            let logdatetime = moment(new Date(req.body.viewmodal_logdatetime)).format("YYYY-MM-DD HH:mm:ss");
            let lastmodifieddatetime = moment(new Date(req.body.viewmodal_lastmodifieddatetime)).format("YYYY-MM-DD HH:mm:ss");
            //TODO - should rather update only the fields have changed!
                let sql = "UPDATE foodprint_harvest SET harvest_supplierShortcode='" + req.body.viewmodal_harvest_suppliershortcode + "', " +
                  "harvest_supplierName='" + req.body.viewmodal_harvest_suppliername + 
                  "',harvest_farmerName='" + req.body.viewmodal_harvest_farmername +
                  "',harvest_supplierAddress='" + req.body.viewmodal_harvest_supplieraddress +
                  "',year_established='" + req.body.viewmodal_harvest_year_established +
                  "',covid19_response='" + req.body.viewmodal_harvest_covid19_response +
                  "',harvest_produceName='" + req.body.viewmodal_harvest_producename +
                 // "',harvest_photoHash='" + req.body.viewmodal_harvest_photohash +
                  "',harvest_TimeStamp='" + harvest_TimeStamp +
                  "',harvest_CaptureTime='" + harvest_CaptureTime +
                  "',harvest_Description='" + req.body.viewmodal_harvest_description +
                  "',harvest_geolocation='" + req.body.viewmodal_harvest_geolocation +
                  "',harvest_quantity='" + req.body.viewmodal_harvest_quantity +
                  "',harvest_unitOfMeasure='" + req.body.viewmodal_harvest_unitofmeasure +
                //  "',harvest_description_json='" + req.body.viewmodal_harvest_description_json +
                  "',harvest_BlockchainHashID='" + req.body.viewmodal_harvest_blockchainhashid +
                  "',harvest_BlockchainHashData='" + req.body.viewmodal_harvest_blockchainhashdata +
                  "',supplierproduce='" + req.body.viewmodal_supplierproduce +
                  "',harvest_bool_added_to_blockchain='" + req.body.viewmodal_harvest_bool_added_to_blockchain +
                 // "',harvest_added_to_blockchain_date='" + req.body.viewmodal_harvest_added_to_blockchain_date +
                  "',harvest_added_to_blockchain_by='" + req.body.viewmodal_harvest_added_to_blockchain_by +
                  "',harvest_blockchain_uuid='" + req.body.viewmodal_harvest_blockchain_uuid +
                  "',harvest_user='" + req.body.viewmodal_harvest_user +
                  "',logdatetime='" + logdatetime +
                  "',lastmodifieddatetime='" + lastmodifieddatetime +
                  "' WHERE harvest_logid='" + req.body.viewmodal_harvest_logid + "'";
              //console.log('UPDATE Harvestsql ' + sql);
              try {
                  connection.query(sql, function(err, results){
                      if(err) {
                          //throw err;
                          console.log('Error - Update Harvest failed');
                          console.log(err);
                          req.flash('error', err.message)
                          // redirect to harvest logbook page
                          res.redirect('/app/harvest')
                      } 
                      else{
                          req.flash('success', 'Harvest entry updated successfully! Harvest ID = ' + req.body.viewmodal_harvest_logid);
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
//TODO - should we add a deleted field and rather set that to 1 instead of an actual delete?
router.post('/delete', upload.none(),
    [
    check('viewmodal_harvest_logid', 'Harvest ID value is not valid').not().isEmpty().trim().escape(),
  ],
  function(req, res) {
    let sql = "DELETE FROM foodprint_harvest WHERE harvest_logid='"+req.body.viewmodal_harvest_logid+"'";
    //console.log('DELETE Harvest sql ' + sql);
    console.log('configid ' + req.body.viewmodal_harvest_logid);
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            let query = connection.query(sql, (err, results) => {
                if(err) {
                    //throw err;
                    req.flash('error', err.message)
                    // redirect to harvest logbook page
                    res.redirect('/app/harvest')
                } else{
                    req.flash('success', 'Harvest entry deleted successfully! Harvest ID = ' + req.body.viewmodal_harvest_logid);
                    res.redirect('/app/harvest');
                }
            });
        }
    });

 
module.exports = router;