var createError = require('http-errors');
var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan'); //Morgan is an HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application.
var flash = require('express-flash');
var session = require('express-session');
var QRCode = require('qrcode');
var cors = require('cors');
var path = require('path');
var router = express.Router();
var connection  = require('./src/js/db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var fs = require('fs')

//only load the .env file if the server isn’t started in production mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

//emailer configuration
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body

//sanitization and validation
const { check, validationResult, sanitizeParam } = require('express-validator');
//alternative import
//var expressValidator  = require('express-validator'); 
//expressValidator.sanitizeBody, expressValidator.sanitizeParam, expressValidator.body etc

const uuidv4 = require('uuid/v4')
var db = require('./dbxml/localdb');
var app = express();
var configRouter = require('./routes/config');
var harvestRouter = require('./routes/harvest');
var storageRouter = require('./routes/storage');
var authRouter = require('./routes/auth');
var ROLES = require('./utils/roles');

// enable ssl redirect
app.use(sslRedirect([
  'other',
  //'development',
  'production'
  ]));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// You can set morgan to log differently depending on your environment

// create a write stream (in append mode), to current directory
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

if (app.get('env') == 'production') {
  app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }})); // only log error responses, write log lines to process.stdout
 // app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/access.log' }));
} else {
  app.use(logger('dev', {stream: accessLogStream}));//write logfile to current directory, flag a is append 
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(cors());

app.use(session({
 secret: '123456cat',
 resave: false,
 saveUninitialized: true,
 cookie: { maxAge: 1800000 } // time im ms: 60000 - 1 min, 1800000 - 30min, 3600000 - 1 hour
}))

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// middleware for all views
app.use(function(req,res,next){
  // locals is deleted at the end of current request, flash is deleted after it is displayed, and it is stored in session intermediately.
  // (this works with redirect)
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success")
  next();
});  

// Mount routers
app.use('/', router);
app.use('/app/config', configRouter);
app.use('/app/auth', authRouter);
app.use('/app/harvest', harvestRouter);
app.use('/app/storage', storageRouter);

app.use(express.static(path.join(__dirname,"src")));
app.use(express.static(path.join(__dirname,'build')));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

// We will use two LocalStrategies, one for file-based auth and another for db-auth
passport.use('file-local', new LocalStrategy({
  usernameField: 'loginUsername', //useful for custom id's on yor credentials fields, if this is incorrect you get a missing credentials error
  passwordField: 'loginPassword', //useful for custom id's on yor credentials fields
  },
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { 
        return cb(err); 
      }
      if (!user) { 
        return cb(null, false, { message: 'Incorrect username.' }); 
      }
      if (user.password != password) { 
        return cb(null, false, { message: 'Incorrect password.' }); 
      }
      return cb(null, user); // If the credentials are valid, the verify callback invokes done to supply Passport with the user that authenticated.
    });
  }));

passport.use('db-local', new LocalStrategy({
  usernameField: 'loginUsername', //useful for custom id's on yor credentials fields, if this is incorrect you get a missing credentials error
  passwordField: 'loginPassword', //useful for custom id's on yor credentials fields
  },
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { 
        return cb(null, false, { message: 'Incorrect username.' }); 
      }
      if (user.password != password) { 
        return cb(null, false, { message: 'Incorrect password.' }); 
      }
      return cb(null, user); // If the credentials are valid, the verify callback invokes done to supply Passport with the user that authenticated.
    });
  }));

  
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

 // catch 404 and forward to error handler
 app.use(function(req, res, next) {
   next(createError(404));
 });



//home page
router.get('/',function(req,res){
  res.render('index', { user:req.user, page_name:'home' });
  //res.sendFile(path.join(__dirname+'/src/index.html')); //__dirname : It will resolve to your project folder.
});

//supply chain - harvest and storage
router.get( '/app/supplychain',     
            require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
function(req,res){
  res.render('supplychain', { user:req.user , page_name:'supplychain'});
});

//about
router.get('/about',function(req,res){
  res.render('about', { user:req.user, page_name:'about'  });
});

//produce gallery
router.get('/gallery',function(req,res){
  res.render('gallery', { user:req.user, page_name:'gallery' });
});

//farmers
router.get('/farmers',function(req,res){
  res.render('farmers', { user:req.user, page_name:'farmers' });
});

//markets
router.get('/markets',function(req,res){
  res.render('markets', { user:req.user, page_name:'markets' });
});

//retailers
router.get('/retailers',function(req,res){
  res.render('retailers', { user:req.user, page_name:'retailers' });
});

//pricing
router.get('/pricing',function(req,res){
  res.render('pricing', { user:req.user, page_name:'pricing' });
});

//food101
router.get('/food101',function(req,res){
  res.render('food101', { user:req.user, page_name:'food101' });
});

//tech101
router.get('/tech101',function(req,res){
  res.render('tech101', { user:req.user, page_name:'tech101' });
});

//trace_produce
router.get('/app/trace_produce',
          require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}), 
          function(req,res){
  res.render('trace_produce', { user:req.user, page_name:'trace_produce' });
});

//blockchain_explorer
router.get('/app/blockchain_explorer',
          require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}), 
          function(req,res){
  res.render('blockchain_explorer', { user:req.user, page_name:'blockchain_explorer' });
});

//contact
router.get('/contact',function(req,res){
  res.render('contact', { user:req.user, page_name:'contact' });
});

//return template for what is at the market this week
router.get('/weekly',   
            require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
            function(req,res){
              res.render('weekly', { user:req.user, page_name:'weekly' });
          });

//return template for how
router.get('/how',function(req,res){
  res.render('how', { user:req.user, page_name:'how' });
});

//return template for terms and conditions
router.get('/terms',function(req,res){
  res.render('termsofuse', { user:req.user, page_name:'terms' });
});

//return template for privacy policy
router.get('/privacy',function(req,res){
  res.render('privacypolicy', { user:req.user, page_name:'privacy' });
});

//return template with scan results for produce
//NB this is an old template (scanresultv1) which probably should be removed
router.get('/scan/:id',function(req,res){
  var supplierProduceID = req.params.id; //OranjezichtCityFarm_Apples
  var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false

  // http://localhost:3000/scan/OranjezichtCityFarm_Apples
     connection.query('\n' +
         'SELECT \n' +
         '\ts.counter,\n' +
         '\ts.ID,\n' +
         '\ts.marketID,\n' +
         '\ts.marketAddress,\n' +
         '\ts.quantity,\n' +
         '\ts.unitOfMeasure,\n' +
         '\ts.storageTimeStamp,\n' +
         '\ts.storageCaptureTime,\n' +
         '\ts.URL,\n' +
         '\ts.hashID,\n' +
         '\ts.storageDescription,\n' +
         '\ts.geolocation,\n' +
         '\ts.supplierproduce,\n' +
         '\th.supplierID,\n' +
         '\th.supplierAddress,\n' +
         '\th.productID,\n' +
         '\th.photoHash,\n' +
         '\th.harvestTimeStamp,\n' +
         '\th.harvestCaptureTime,\n' +
         '\th.harvestDescription,\n' +
         '\th.geolocation\n' +
         'FROM \n' +
         '\tstorage s \n' +
         'INNER JOIN\n' +
         '\tharvest h\n' +
         'ON \n' +
         '\ts.supplierproduce = h.supplierproduce\n' +
         'WHERE  \n' +
         '\ts.supplierproduce = ? AND \n' +
         '\th.counter = (SELECT max(counter) FROM harvest where supplierproduce = ?) AND \n' +
         '    s.counter = (SELECT max(counter) FROM storage where supplierproduce = ?);',
        [
            supplierProduceID,
            supplierProduceID,
            supplierProduceID
        ],
         function(err,rows) {
            if(err){
             //req.flash('error', err);
             console.error('error', err);
             res.render('scanresultv1',{  data:'', user:req.user, 
                                        showTracedOnBlockchain:boolTracedOnBlockchain, 
                                        page_name:'scanresultv1'
                                      });
            }
            else {
                res.render('scanresultv1',{ data:rows, user:req.user,
                                          showTracedOnBlockchain:boolTracedOnBlockchain,
                                          page_name:'scanresultv1'
                                        });
            }
         });
});

//return template with scan results for produce i.e. http://localhost:3000/app/scan/WMNP_Fennel
//TODO Return Farmers email address as part of provenance_data
//TODO Update to include marketid '/app/scan/:marketid/:id' i.e. http://localhost:3000/app/scan/ozcf/WMNP_Fennel
router.get('/app/scan/:id', [sanitizeParam('id').escape().trim()], function(req,res){
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel
     connection.query('SELECT harvest_supplierShortcode, harvest_supplierName, harvest_farmerName, year_established, harvest_description_json,' +
                      'harvest_photoHash, harvest_supplierAddress, harvest_produceName, harvest_TimeStamp, harvest_CaptureTime,' +
                      'harvest_Description, harvest_geolocation,supplierproduce, market_Address,' +
                      'market_storageTimeStamp, market_storageCaptureTime, logdatetime, lastmodifieddatetime ' + 
                      'FROM foodprint_weeklyview WHERE supplierproduce = ? AND ' +
                      'logdatetime < (date(curdate() - interval weekday(curdate()) day + interval 1 week)) AND '+  
                      'logdatetime > (date(curdate() - interval weekday(curdate()) day));',
                      [
                          supplierProduceID
                      ],
                      function(err,rows) {
                          if(err){
                          //req.flash('error', err);
                          var provenance_data = '';
                          console.error('error', err);
                          console.error('Provenance scan error occured');
                          }
                          else {
                            if (typeof rows !== 'undefined' && rows.length){
                              rows[0].harvest_photoHash = 'data:image/png;base64,' + new Buffer(rows[0].harvest_photoHash, 'binary').toString('base64');
                            }
                              var provenance_data = rows;
                              console.log('Provenance scan successful');
                          }
                              
                          var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false
                          
                          //START Track QR Scan (this could be done as xhr when scan page is rendered)
                              var marketID = 'ozcf'; //shortcode e.g. ozcf
                              var logid = uuidv4()
                              var qrid = '' //TODO this is not yet being tracked in config
                              
                              //http://localhost:3000/app/scan/WMNP_Fennel
                              //https://www.foodprintapp.com/app/scan/WMNP_Fennel
                              var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl; 
                              
                              var request_host = req.get('host')
                              var request_origin = req.headers.referer
                              //req.headers.referer - The Referer request header contains the address of the previous web page 
                              //from which a link to the currently requested page was followed. 
                              //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.
                              
                              //alternative would have been to use origin request header
                              //The Origin request header indicates where a fetch originates from.
                              
                              var request_useragent = req.headers['user-agent']
                              var logdatetime = new Date();
                            
                              //TODO - cross check marketID and supplierProduceID against existing marketID's from foodprint_market and foodPrint_supplierproduceid
                                connection.query( 'INSERT INTO foodprint_qrcount (' +
                                                  'logid , qrid, qrurl, marketid, request_host,' +
                                                  'request_origin, request_useragent,logdatetime) ' +
                                                  ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
                                                  [
                                                    logid, qrid, qrurl, marketID, request_host,
                                                    request_origin, request_useragent, logdatetime
                                                ]
                                                ,function(err, res2) {
                                                    if (err) {
                                                      console.error('Produce scan tracking error occured');
                                                      console.error('error', err);
                                                    }
                                                    else{
                                                      console.log('Produce scan tracking successful');
                                                    }                                                    
                                                  });
                          //END Track QR Scan
                          
                          res.render('scanresult',{data:provenance_data, user:req.user, 
                                                  showTracedOnBlockchain:boolTracedOnBlockchain,
                                                  page_name:'scanresult'})
                        }  
         ); //end of connection.query
      });

//REST API Get a single produce data record (twin to router.get('/app/scan/:id'))
//return json with scan results for produce http://localhost:3000/app/api/v1/scan/WMNP_Fennel
//TODO Update to include marketid '/app/scan/:marketid/:id' i.e. http://localhost:3000/app/api/v1/scan/ozcf/WMNP_Fennel
router.get('/app/api/v1/scan/:id', [sanitizeParam('id').escape().trim()], function(req,res){
  var supplierProduceID = req.params.id; //OZCF_Apples or WMNP_Fennel
     connection.query('SELECT harvest_supplierShortcode, harvest_supplierName, harvest_farmerName, year_established, harvest_description_json,' +
                      'harvest_photoHash, harvest_supplierAddress, harvest_produceName, harvest_TimeStamp, harvest_CaptureTime,' +
                      'harvest_Description, harvest_geolocation,supplierproduce, market_Address, year_established, covid19_response,' +
                      'market_storageTimeStamp, market_storageCaptureTime, logdatetime, lastmodifieddatetime ' + 
                      'FROM foodprint_weeklyview WHERE supplierproduce = ? AND ' +
                      'logdatetime < (date(curdate() - interval weekday(curdate()) day + interval 1 week)) AND '+  
                      'logdatetime > (date(curdate() - interval weekday(curdate()) day));',
                      [
                          supplierProduceID
                      ],
                      function(err,rows) {
                          if(err){
                          //req.flash('error', err);
                          var provenance_data = [];
                          console.error('error', err);
                          console.error('Provenance scan error occured');
                          //res.render('scanresult',{data:'', user:req.user});
                          }
                          else {
                            if (typeof rows !== 'undefined' && rows.length){
                              rows[0].harvest_photoHash = 'data:image/png;base64,' + new Buffer(rows[0].harvest_photoHash, 'binary').toString('base64');

                              var provenance_data = rows[0]; // return 1st row only
                            }
                            else{
                              var provenance_data = []; // return empty list for no data
                            }
                              
                              console.log('Provenance scan successful');
                          }
                              
                          var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false
                          
                          //START Track QR Scan (this could be done as xhr when scan page is rendered)
                              var marketID = 'ozcf'; //shortcode e.g. ozcf
                              var logid = uuidv4()
                              var qrid = '' //TODO this is  t yet being tracked in config
                              
                              //http://localhost:3000/app/scan/WMNP_Fennel
                              //https://www.foodprintapp.com/app/scan/WMNP_Fennel
                              var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl; 
                              
                              var request_host = req.get('host')
                              var request_origin = req.headers.referer
                              //req.headers.referer - The Referer request header contains the address of the previous web page 
                              //from which a link to the currently requested page was followed. 
                              //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.
                              
                              //alternative would have been to use origin request header
                              //The Origin request header indicates where a fetch originates from.
                              
                              var request_useragent = req.headers['user-agent']
                              var logdatetime = new Date();
                            
                              //TODO - cross check marketID and supplierProduceID against existing marketID's from foodprint_market and foodPrint_supplierproduceid
                                // connection.query( 'INSERT INTO foodprint_qrcount (' +
                                //                   'logid , qrid, qrurl, marketid, request_host,' +
                                //                   'request_origin, request_useragent,logdatetime) ' +
                                //                   ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
                                //                   [
                                //                     logid, qrid, qrurl, marketID, request_host,
                                //                     request_origin, request_useragent, logdatetime
                                //                 ]
                                //                 ,function(err, res2) {
                                //                     if (err) {
                                //                       console.error('Produce scan tracking error occured');
                                //                       console.error('error', err);
                                //                     }
                                //                     console.log('Produce scan tracking successful');
                                //                     //callback(null, res2); // think 'return'
                                //                     });
                          //END Track QR Scan
                          provenance_data['user']= req.user;
                          provenance_data['showTracedOnBlockchain']= boolTracedOnBlockchain;
                          provenance_data['page_name']= 'home';
                        res.end(JSON.stringify(provenance_data)); //res.end() method to send data to client as json string via JSON.stringify() methoD
                      }); //end of connection.query
                      
      });

//TODO Add Weekly View route and template
//TODO Add Weekly View REST API

//return template with market checkin form e.g. http://localhost:3000/checkin/ozcf
router.get('/checkin/:market_id', [sanitizeParam('market_id').escape().trim()], function(req,res){
  var boolCheckinForm = process.env.SHOW_CHECKIN_FORM || false
  var marketID = req.params.market_id; //shortcode e.g. ozcf
  var logid = uuidv4()
  var qrid = '' //TODO this is not yet being tracked in config
  var qrurl = req.protocol + '://' + req.get('host') + req.originalUrl;
  var request_host = req.get('host')
  var request_origin = req.headers.referer
  //req.headers.referer - The Referer request header contains the address of the previous web page 
  //from which a link to the currently requested page was followed. 
  //The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.
  
  //alternative would have been to use origin request header
  //The Origin request header indicates where a fetch originates from.
  
  var request_useragent = req.headers['user-agent']
  var logdatetime = new Date();

  //TODO - cross check marketID against existing marketID's from foodprint_market
  
  try {
    connection.query('\n' +
        'INSERT INTO foodprint_qrcount (\n' +
        '        logid ,\n' +
        '        qrid,\n' +
        '        qrurl,\n' +
        '        marketid,\n' +
        '        request_host,\n' +
        '        request_origin,\n' +
        '        request_useragent,\n' +
        '        logdatetime)\n' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [
          logid,
          qrid,
          qrurl,
          marketID,
          request_host,
          request_origin,
          request_useragent,
          logdatetime
      ],function(err,rows)     {
      if(err){
       //req.flash('error', err);
       //console.error('error', err)
       console.error('Market checkin tracking error occured');
      // res.status.json({ err: err });
      }else{
          console.log('Market checkin tracking successful');
          //res.json({ success: true, email: checkin_email });
      }
       });
} catch (e) {
  //TODO log the error
  //this will eventually be handled by your error handling middleware
  //next(e)
  //res.json({success: false, errors: e});
  //console.error('error', err)
  console.error('Market checkin tracking error occured');
  res.render('checkin.ejs',{ data:marketID, showCheckinForm:boolCheckinForm, user:req.user, page_name:'checkin' });
}
  res.render('checkin.ejs',{ data:marketID, showCheckinForm:boolCheckinForm, user:req.user, page_name:'checkin' });
});


//market checkin XmlHTTP request
router.post('/marketcheckin', [
    check('checkin_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
  ],
    function(req,res){
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.json({ errors: errors.array(), success: false});
        }
      else {
          var checkin_market_id = req.body.checkin_market_id;
          var checkin_email = req.body.checkin_email;
          var checkin_datetime = new Date();
          var checkin_firstname = '';
          var checkin_surname = '';

            try {
              connection.query('\n' +
                  'INSERT INTO market_subscription (\n' +
                  '        market_id ,\n' +
                  '        firstname,\n' +
                  '        surname,\n' +
                  '        email,\n' +
                  '        logdatetime)\n' +
                  'VALUES (?, ?, ?, ?, ?);',
                  [
                    checkin_market_id,
                    checkin_firstname,
                    checkin_surname,
                    checkin_email,
                    checkin_datetime
                ],function(err,rows)     {
                if(err){
                 //req.flash('error', err);
                 console.error('error', err);
                 res.status.json({ err: err });
                }else{
                    console.log('add market_subscription DB success');
                    res.json({ success: true, email: checkin_email });
                }
                 });
          } catch (e) {
            //this will eventually be handled by your error handling middleware
            next(e)
            res.json({success: false, errors: e});
          }
        }
});


router.get('/test_db', 
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
  async (req, res, next) => {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser){
    try {
        connection.query('SELECT * FROM metaTable ORDER BY ProduceID desc',function(err,rows)     {
          if(err){
          //req.flash('error', err);
          console.error('error', err);
          res.render('./test_db',{page_title:"Farmers - Farm Print",data:'', user:req.user,
                      page_name:'testdb'});
          }else{
              console.log('Render SQL results');
              res.render('./test_db',{page_title:"Farmers - FarmPrint",data:rows, user:req.user,
                      page_name:'testdb'});
          }
          });
    } catch (e) {
      //this will eventually be handled by your error handling middleware
      next(e)
    }
  }else{
    res.render('error',{    message: 'You are not authorised to view this resource.', 
                            title: 'Error', user: req.user, page_name:'error' });
    }
});

//addHarvest XmlHTTP request
router.post('/app/addHarvest',function(req,res){
    // ID ,supplierID,supplierAddress,productID,photoHash,harvestTimeStamp,harvestCaptureTime,harvestDescription,
    // geolocation,supplierproduce
  // console.log("addHarvest" + req.body);
    try {
      connection.query('\n' +
          'INSERT INTO harvest (\n' +
          '        ID ,\n' +
          '        supplierID,\n' +
          '        supplierAddress,\n' +
          '        productID,\n' +
          '        photoHash,\n' +
          '        harvestTimeStamp,\n' +
          '        harvestCaptureTime,\n' +
          '        harvestDescription,\n' +
          '        geolocation,\n' +
          '        supplierproduce)\n' +
          'VALUES (?, ?,?,?,?,?,?,?,?, ?);',
          [
            req.body.ID ,
            req.body.supplierID,
            req.body.supplierAddress,
            req.body.productID,
            req.body.photoHash,
            req.body.harvestTimeStamp,
            req.body.harvestCaptureTime,
            req.body.harvestDescription,
            req.body.geolocation,
            req.body.supplierproduce
        ],function(err,rows)     {
        if(err){
         //req.flash('error', err);
         console.error('error', err);
        }else{
            console.log('addHarvest DB success');
        }
         });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});

//addStorage XmlHTTP request
router.post('/app/addStorage',function(req,res){
    // ID,marketID,marketAddress,quantity,unitOfMeasure,storageTimeStamp,storageCaptureTime,URL,hashID,
    // storageDescription,geolocation,supplierproduce

  // console.log("addStorage" + req.body);
  try {
      connection.query('INSERT INTO storage (\n' +
          '        ID,\n' +
          '        marketID,\n' +
          '        marketAddress,\n' +
          '        quantity,\n' +
          '        unitOfMeasure,\n' +
          '        storageTimeStamp,\n' +
          '        storageCaptureTime,\n' +
          '        URL,\n' +
          '        hashID,\n' +
          '        storageDescription,\n' +
          '        geolocation,\n' +
          '        supplierproduce)\n' +
          'VALUES (?, ?,?,?, ?,?, ?,?, ?, ?, ?, ?);',
          [
            req.body.ID ,
            req.body.marketID,
            req.body.marketAddress,
            req.body.quantity,
            req.body.unitOfMeasure,
            req.body.storageTimeStamp,
            req.body.storageCaptureTime,
            req.body.URL,
            req.body.hashID,
            req.body.storageDescription,
            req.body.geolocation,
            req.body.supplierproduce
        ],function(err,rows)     {
        if(err){
         console.error('error', err);
        }else{
            console.log('addStorage DB success');
        }});
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});


//subscribe XmlHTTP request
router.post('/subscribe', [
    //check('sample_name').not().isEmpty().withMessage('Name must have more than 5 characters'),
    //check('sample_classYear', 'Class Year should be a number').not().isEmpty(),
    //check('weekday', 'Choose a weekday').optional(),
    check('subscribe_email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
  ],
    function(req,res){
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.json({ errors: errors.array(), success: false});
        }
      else {
          var subscriber_email = req.body.subscribe_email;
          var subscriber_datetime = new Date();
          var subscriber_firstname = '';
          var subscriber_surname = '';

          try {
              connection.query('\n' +
                  'INSERT INTO foodprint_subscription (\n' +
                  '        firstname ,\n' +
                  '        surname,\n' +
                  '        email,\n' +
                  '        logdatetime)\n' +
                  'VALUES (?, ?, ?, ?);',
                  [
                      subscriber_firstname,
                      subscriber_surname,
                      subscriber_email,
                      subscriber_datetime
                  ], function (err, rows) {
                      if (err) {
                          //req.flash('error', err);
                          console.error('error', err);
                          res.status.json({err: err});
                      } else {
                          console.log('add foodprint_subscription DB success');
                          res.json({success: true, email: subscriber_email});
                      }
                  });
          } catch (e) {
              //this will eventually be handled by your error handling middleware
              next(e);
              res.json({success: false, errors: e});
          }
      }
});

//Test Email XmlHTTP request
router.post('/app/testemail', function(req,res){
  let mailOptions = {
    to: process.env.TEST_EMAIL_ADDRESS,
    subject: "Test Email",
    html: "<h2>Welcome to FoodPrint</h2><p>This is a test email.</p>"
  };
  
  transporter.sendMail(mailOptions, function(error, data) {
    if (error) {
      console.log("Error sending email - ", error);
      res.status.json({err: error});
    } else {
      console.log("Email successfully sent - ", data);
      res.json({success: true});
    }
  });
});


//contactform XmlHTTP request
router.post('/contactform', [
check('contact_email', 'Contact email is not valid').not().isEmpty().isEmail().normalizeEmail(),
check('contact_message', 'Contact message should not be empty').not().isEmpty(),
check('contact_fname', 'Contact first name should not be empty').not().isEmpty(),
check('contact_lname', 'Contact last name should not be empty').not().isEmpty(),
],
function(req,res){
const errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.json({ errors: errors.array(), success: false});
    }
  else {
      var contact_email = req.body.contact_email; 
      var contact_fname = req.body.contact_fname;  
      var contact_lname = req.body.contact_lname;
      var contact_message = req.body.contact_message;
      var contact_datetime = new Date();
      var contact_subject = "FoodPrint Website Contact Enquiry";
      var contact_message_formatted = "<p>Email Sender: " + contact_email + 
                                      "</p><p>Email Message: " + contact_message + 
                                      "</p><br><br><p>Sent from https://www.foodprintapp.com/contact by </p>" +  
                                      contact_fname + " " + contact_lname + " (" + contact_datetime +")."

      let mailOptions = {
        to: [process.env.EMAIL_ADDRESS, process.env.TEST_EMAIL_ADDRESS],
        subject: contact_subject,
        html: contact_message_formatted
      };
      
      transporter.sendMail(mailOptions, function(error, data) {
        if (error) {
          console.log("Error sending email - ", error);
          res.status.json({err: error});
        } else {
          console.log("Email successfully sent - ", data);
          res.json({success: true});
        }
      });
    };
});

//traceproduce (i.e. produce search) XmlHTTP request
router.post('/app/traceproduce', [
  check('search_term', 'Search term is not valid').not().isEmpty().trim().escape(),
],
  function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array(), success: false});
      }
    else {
      try {
          let storage_sql = "SELECT harvest_logid, storage_logid, market_storageTimeStamp, supplierproduce FROM foodprint_storage WHERE storage_logid='" + req.body.search_term + 
          "' OR harvest_logid='" + req.body.search_term + 
          "' OR supplierproduce LIKE '%" + req.body.search_term + 
          "%' OR supplierproduce='" + req.body.search_term +"'";
          console.log('sql ' + storage_sql);

          let harvest_sql = "SELECT harvest_logid, supplierproduce, harvest_quantity, harvest_unitofmeasure, harvest_TimeStamp  FROM foodprint_harvest WHERE harvest_logid='" + req.body.search_term + 
          "' OR harvest_produceName='" + req.body.search_term + 
          "' OR supplierproduce LIKE '%" + req.body.search_term + 
          "%' OR supplierproduce='" + req.body.search_term +"'";
          console.log('harvest_sql ' + harvest_sql);

            connection.query(storage_sql, function(err,storage_rows){
              if(err){
                  console.error('error', err);
                  res.status.json({err: err});
              }else{
                  connection.query(harvest_sql, function(err,harvest_rows){
                      if(err){
                        console.error('error', err);
                        res.status.json({err: err});
                      }else{
                        console.log('Search DB success');
                        res.json({success: true, produce_harvest_data:harvest_rows, produce_storage_data:storage_rows});
                      }
                  });
              }
          });
        } catch (e) {
            //this will eventually be handled by your error handling middleware
            next(e);
            res.json({success: false, errors: e});
        }
    }
});


router.post('/test_qrcode', async (req, res, next) => {
  try {
      // Get the text to generate QR code
    //let qr_txt = req.body.qr_text;
    let produceUrl = "http://www.google.com";
    let supplier = "supplier";
    let produce = "Storage";
    var res2 = await QRCode.toDataURL(produceUrl);
  var QRFileName = supplier + produce;
  QRFileName = QRFileName.trim();
  var QRDirectory = '../static/';
  var QRFullName = QRDirectory + QRFileName+".png";
  QRFullName = QRFullName.trim();
    console.log('Wrote to ' + res2);
    res.json(res2);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});

// error handler 
// to define an error-handling middleware, we simply define a middleware in our server.js with four arguments: err, req, res, and next. 
// As long as we have these four arguments, Express will recognize the middleware as an error handling middleware
//Note that error handler must be the last middleware in chain, so it should be defined in the bottom of your application.js file after other app.use() and routes calls. 
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
// render the error page
  res.status(err.status || 500);
  res.render('error', { user:req.user, page_name:'error' });
});

// alternative error handlers based on mode
// app.configure('development', () => {
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// })

// app.configure('production', () => {
//   app.use(express.errorHandler())
// })

app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');

