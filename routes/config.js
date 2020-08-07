var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')
var body = require('express-validator'); //validation
var connection  = require('../src/js/db');
var ROLES = require('../utils/roles');


/* GET configuration page. */
router.get('/',
    require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
    function(req, res, next){
        if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
            connection.query('SELECT * FROM foodprint_config ORDER BY pk desc',function(err,rows)     {
                if(err){
                     req.flash('error', err);
                     res.render('config',{  page_title:"FoodPrint - Global Configuration", 
                                            data:'', user: req.user, page_name:'config' });
                }else{
                    res.render('config',{   page_title:"FoodPrint - Global Configuration", 
                                            data:rows, user: req.user, page_name:'config' });
                }
             });
          }else{
            res.render('error',{    message: 'You are not authorised to view this resource.', 
                                    title: 'Error', user: req.user, page_name:'error' });
            //res.send sends back a json object
            // return res.send(403,{
            //   'status': 403,
            //   'code': 1, // custom code that makes sense for your application
            //   'message': 'You are not a premium user',
            //   'moreInfo': 'custom code that makes sense for your application'
            // });
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
              req.flash('error', errors)
              res.render('config',{page_title:"FoodPrint - Global Configuration", data:'',
                                    page_name:'config'}); //should add error array here
            }
          else {
              let config_datetime = new Date();
              let config_uuid = uuidv4()
              let data = {
                  configname: req.body.config_name, configdescription: req.body.config_description,
                  configvalue: req.body.config_value, logdatetime: config_datetime, configid: config_uuid
              };
              let sql = "INSERT INTO foodprint_config SET ?";
              try {
                  connection.query(sql, data, function(err, results) {
                      if(err) {
                          //throw err;
                          req.flash('error', err)
                          // redirect to configuration list page
                          res.redirect('/app/config')
                      } else{
                          req.flash('success', 'New Configuration added successfully! Config Name = ' + req.body.config_name);
                          res.redirect('/app/config');
                      }
                  });
                  } catch (e) {
                      //this will eventually be handled by your error handling middleware
                      next(e);
                      //res.json({success: false, errors: e});
                    res.render('config',{page_title:"FoodPrint - Global Configuration", data:'',
                    success: false, errors:e.array(), page_name:'config'});
                  }
          }
    });

//route for update data
router.post('/update', [
    check('config_name', 'Your config name is not valid').not().isEmpty().trim().escape(),
    check('config_description', 'Your config description is not valid').not().isEmpty().trim().escape(),
    check('config_value', 'Your config value is not valid').not().isEmpty().trim().escape(),
  ], function(req, res) {
    const result = validationResult(req);
        var errors = result.errors;
        for (var key in errors) {
            console.log('Validation error - ' + errors[key].msg);
      }
          if (!result.isEmpty()) {
              req.flash('error', errors)
              res.render('config',{page_title:"FoodPrint - Global Configuration", data:'',
                            page_name:'config'}); //should add error array here
            }
          else {
              let sql = "UPDATE foodprint_config SET configname='" + req.body.config_name + "', " +
                  "configdescription='" + req.body.config_description + "',configvalue='" + req.body.config_value +
                  "' WHERE configid='" + req.body.config_id + "'";
              //console.log('sql ' + sql);
              //console.log('configid ' + req.body.config_id);
              try {
                  connection.query(sql, function(err, results){
                      if(err) {
                          //throw err;
                          req.flash('error', err)
                          // redirect to configuration list page
                          res.redirect('/app/config')
                      } else{
                          req.flash('success', 'Configuration updated successfully! Config Name = ' + req.body.config_name);
                  res.redirect('/app/config');
              }
              })
                  ;
              } catch (e) {
                  //this will eventually be handled by your error handling middleware
                  next(e);
                  //res.json({success: false, errors:errors.array()});
                  res.render('config', {
                      page_title: "FoodPrint - Global Configuration", data: '',
                      success: false, errors: e.array(),
                      page_name:'config'
                  });
              }
          }
    });

//route for delete data
router.post('/delete',(req, res) => {
  let sql = "DELETE FROM foodprint_config WHERE configid='"+req.body.config_id2+"'";
  // console.log('sql ' + sql);
  // console.log('configname ' + req.body.config_name2);
  // console.log('configid ' + req.body.config_id2);
  let query = connection.query(sql, (err, results) => {
    if(err) {
        //throw err;
        req.flash('error', err)
        // redirect to configuration list page
        res.redirect('/app/config')
    } else{
        req.flash('success', 'Configuration deleted successfully! Config Name = ' + req.body.config_name2);
        res.redirect('/app/config');
      }
  });
});

 
module.exports = router;