var createError = require('http-errors');
const express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
const QRCode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const app = express();
const path = require('path');
const router = express.Router();
var mysql = require('mysql');
var connection  = require('./src/js/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
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

app.use(express.static(path.join(__dirname,"src")));
app.use(express.static(path.join(__dirname,'build')));
//app.use(express.static('build'));

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
  const supplierProduceID = req.params.id;
  //TODO write a function that takes the supplierProduceID e.g. OranjezichtCityFarm_Apples
  //and returns the farm profile, harvest and storage id
     connection.query('SELECT * FROM metaTable ORDER BY ProduceID desc',function(err,rows)     {

        if(err){
         req.flash('error', err);
         res.render('customers',{page_title:"Customers - Node.js",data:''});
        }else{

            res.render('customers',{page_title:"Customers - Node.js",data:rows});
        }

         });
  res.sendFile(path.join(__dirname+'/src/scanresult.html'));
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


router.get('/test_qrcode', async (req, res, next) => {
  try {
      // Get the text to generate QR code
    //let qr_txt = req.body.qr_text;
    let produceUrl = "http://www.google.com";
    let supplier = "supplier";
    let produce = "Storage";
    const res2 = await QRCode.toDataURL(produceUrl);
  var QRFileName = supplier + produce;
  QRFileName = QRFileName.trim();
  const QRDirectory = '../static/';
  var QRFullName = QRDirectory + QRFileName+".png";
  QRFullName = QRFullName.trim();
    console.log('Wrote to ' + res2);
    res.json(res2);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});


app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

