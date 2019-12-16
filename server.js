var createError = require('http-errors');
var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session');
var QRCode = require('qrcode');
var cors = require('cors');
var path = require('path');
var router = express.Router();
var connection  = require('./src/js/db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')
var body = require('express-validator'); //validation
var sanitizeBody  = require('express-validator'); //sanitization
var db = require('./dbxml/localdb');
var app = express();
var configRouter = require('./routes/config');
var authRouter = require('./routes/auth');
var ROLES = require('./utils/roles');

// enable ssl redirect
app.use(sslRedirect([
  'other',
  'development',
  'production'
  ]));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

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

app.use(function(req,res,next){
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success")
  next();
});  

// Mount routers
app.use('/', router);
app.use('/app/config', configRouter);
app.use('/app/auth', authRouter);

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

  // error handler
 app.use(function(err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};
 // render the error page
   res.status(err.status || 500);
   res.render('error', { user:req.user });
 });

//home page
router.get('/',function(req,res){
  res.render('index', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/index.html')); //__dirname : It will resolve to your project folder.
});

//supply chain - harvest and storage
router.get( '/app/supplychain',     
            require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login'}),    
function(req,res){
  res.render('supplychain', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/supplychain.html'));
});

//about
router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/src/about.html'));
});

//produce gallery
router.get('/gallery',function(req,res){
  res.render('gallery', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/gallery.html'));
});

//farmers
router.get('/farmers',function(req,res){
  res.render('farmers', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/Farmers.html'));
});

//contact
router.get('/contact',function(req,res){
  res.render('contact', { user:req.user });

  //res.sendFile(path.join(__dirname+'/src/contact.html'));
});

//return template for what is at the market this week
router.get('/weekly',function(req,res){
  res.render('weekly', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/weekly.html'));
});

//return template for team
router.get('/team',function(req,res){
  res.sendFile(path.join(__dirname+'/src/team.html'));
});

//return template for how
router.get('/how',function(req,res){
  res.render('how', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/How.html'));
});


//return template for terms and conditions
router.get('/terms',function(req,res){
  res.render('termsofuse', { user:req.user });
  //res.sendFile(path.join(__dirname+'/src/termsofuse.html'));
});

//return sign-in page
router.get('/sign_in',function(req,res){
  res.sendFile(path.join(__dirname+'/src/sign_in.html'));
});

//return template with scan results for produce
router.get('/scan/:id',function(req,res){
  var supplierProduceID = req.params.id; //OranjezichtCityFarm_Apples
  // http://localhost:3000/testscan/OranjezichtCityFarm_Apples
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
             res.render('scanresult',{data:''});
            }
            else {
                res.render('scanresult',{data:rows});
            }
         });
});

//return template with market checkin form e.g. http://localhost:3000/checkin/ozcf
router.get('/checkin/:market_id',function(req,res){
  var marketID = req.params.market_id; //shortcode e.g. ozcf
  res.render('checkin.ejs',{data:marketID});
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


router.get('/test_db', async (req, res, next) => {
  try {
      connection.query('SELECT * FROM metaTable ORDER BY ProduceID desc',function(err,rows)     {
        if(err){
         //req.flash('error', err);
         console.error('error', err);
         res.render('./test_db',{page_title:"Farmers - Farm Print",data:''});
        }else{
            console.log('Render SQL results');
            res.render('./test_db',{page_title:"Farmers - FarmPrint",data:rows});
        }
         });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
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

router.get('/test_qrcode', async (req, res, next) => {
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


app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');

