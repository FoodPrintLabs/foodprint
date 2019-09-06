var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
var QRCode = require('qrcode');
var cors = require('cors');
var app = express();
var path = require('path');
var router = express.Router();
var connection  = require('./src/js/db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('.dbxml/localdb');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(cors());

app.use(session({
 secret: '123456cat',
 resave: false,
 saveUninitialized: true,
 cookie: { maxAge: 60000 }
}))

app.use(flash());
//app.use(expressValidator());

//add the router
app.use('/', router);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname,"src")));
app.use(express.static(path.join(__dirname,'build')));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false, { errors: { 'email or password': 'is invalid' } }); }
      return cb(null, user);
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
   res.render('error');
 });

//home page
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/src/index.html'));
  //__dirname : It will resolve to your project folder.
});

//supply chain - harvest and storage
router.get('/supplychain',function(req,res){
  res.sendFile(path.join(__dirname+'/src/supplychain.html'));
});

//about
router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/src/about.html'));
});

//produce gallery
router.get('/gallery',function(req,res){
  res.sendFile(path.join(__dirname+'/src/gallery.html'));
});

//farmers
router.get('/farmers',function(req,res){
  res.sendFile(path.join(__dirname+'/src/Farmers.html'));
});

//contact
router.get('/contact',function(req,res){
  res.sendFile(path.join(__dirname+'/src/contact.html'));
});

//return template for what is at the market this week
router.get('/weekly',function(req,res){
  res.sendFile(path.join(__dirname+'/src/weekly.html'));
});

//return template for team
router.get('/team',function(req,res){
  res.sendFile(path.join(__dirname+'/src/team.html'));
});

//return template for how
router.get('/how',function(req,res){
  res.sendFile(path.join(__dirname+'/src/How.html'));
});


//return template for terms and conditions
router.get('/terms',function(req,res){
  res.sendFile(path.join(__dirname+'/src/termsofuse.html'));
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
                console.log('Render SQL results');
                console.log('Render SQL results', rows);
                res.render('scanresult',{data:rows});
            }
         });
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
            //console.log('Render SQL results', rows);
            res.render('./test_db',{page_title:"Farmers - FarmPrint",data:rows});
        }
         });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});

//addHarvest XmlHTTP request
router.post('/addHarvest',function(req,res){
    // ID ,supplierID,supplierAddress,productID,photoHash,harvestTimeStamp,harvestCaptureTime,harvestDescription,
    // geolocation,supplierproduce
  // console.log("addHarvest" + req.body);
  // console.log("ID" + req.body.ID);
  // console.log("supplierID" + req.body.supplierID);
  // console.log("supplierAddress" + req.body.supplierAddress);
  // console.log("productID" + req.body.productID);
  // console.log("photoHash" + req.body.photoHash);
  // console.log("harvestTimeStamp" + req.body.harvestTimeStamp);
  // console.log("harvestCaptureTime" + req.body.harvestCaptureTime);
  // console.log("harvestDescription" + req.body.harvestDescription);
  // console.log("geolocation" + req.body.geolocation);
  // console.log("supplierproduce" + req.body.supplierproduce);
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
router.post('/addStorage',function(req,res){
    // ID,marketID,marketAddress,quantity,unitOfMeasure,storageTimeStamp,storageCaptureTime,URL,hashID,
    // storageDescription,geolocation,supplierproduce

  // console.log("addStorage" + req.body);
  // console.log("ID" + req.body.ID);
  // console.log("marketID" + req.body.marketID);
  // console.log("marketAddress" + req.body.marketAddress);
  // console.log("quantity" + req.body.quantity);
  // console.log("unitOfMeasure" + req.body.unitOfMeasure);
  // console.log("storageTimeStamp" + req.body.storageTimeStamp);
  // console.log("storageCaptureTime" + req.body.storageCaptureTime);
  // console.log("URL" + req.body.URL);
  // console.log("hashID" + req.body.hashID);
  // console.log("storageDescription" + req.body.storageDescription);
  // console.log("geolocation" + req.body.geolocation);
  // console.log("supplierproduce" + req.body.supplierproduce);
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

