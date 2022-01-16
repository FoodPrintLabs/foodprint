var createError = require('http-errors');
var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan'); //Morgan is an HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application.
var flash = require('express-flash');
var session = require('express-session');
// var QRCode = require('qrcode');
var cors = require('cors');
var path = require('path');
var router = express.Router();
var connection = require('./src/js/db');
var CUSTOM_ENUMS = require('./src/js/enums')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var nodemailer = require('nodemailer');
var fs = require('fs')
var sequelise = require('./src/js/db_sequelise');


//only load the .env file if the server isn’t started in production mode
if (process.env.NODE_ENV !== CUSTOM_ENUMS.PRODUCTION) {
  require('dotenv').config();
}

//emailer configuration
// let transporter = nodemailer.createTransport({
//   service: CUSTOM_ENUMS.GMAIL,
//   auth: {
//     user: process.env.EMAIL_ADDRESS,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// Testing Emails Pattern
// when testing emails, in NODE_ENV=development, set EMAIL_OVERRIDE
// if EMAIL_OVERRIDE is set, send email to it's value, prepend subject line with [TEST EMAIL], include intended recipients in the body

//sanitization and validation
// const {check, validationResult, sanitizeParam} = require('express-validator');
//alternative import
//var expressValidator  = require('express-validator');
//expressValidator.sanitizeBody, expressValidator.sanitizeParam, expressValidator.body etc

// const uuidv4 = require('uuid/v4')
var db = require('./dbxml/localdb');
var app = express();
var configRouter = require('./routes/config');
var harvestRouter = require('./routes/harvest');
var storageRouter = require('./routes/storage');
var authRouter = require('./routes/auth');
// var blockchainRouter = require('./routes/blockchain');

var testRouter = require('./routes/test');
var searchRouter = require('./routes/search');
var websiteRouter = require('./routes/website');

var apiRouter = require('./routes/api');

// var ROLES = require('./utils/roles');
// const {Sequelize} = require("sequelize");

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
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

// only log error responses, write log lines to process.stdout
if (app.get('env') == CUSTOM_ENUMS.PRODUCTION) {
  app.use(logger('common', {
    skip: function (req, res) {
      return res.statusCode < 400
    }
  }));
  // app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/access.log' }));
} else {
  //write logfile to current directory, flag a is append
  app.use(logger('dev', {stream: accessLogStream}));
}

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());
app.use(cors());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 1800000} // time im ms: 60000 - 1 min, 1800000 - 30min, 3600000 - 1 hour
}))

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// middleware for all views
app.use(function (req, res, next) {
  // locals is deleted at the end of current request, flash is deleted after it is displayed,
  // and it is stored in session intermediately.
  // (this works with redirect)
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success")
  next();
});

// Mount routers
app.use('/', router);
// app.use('/', blockchainRouter);
app.use('/app/config', configRouter);
app.use('/app/auth', authRouter);
app.use('/app/harvest', harvestRouter);
app.use('/app/storage', storageRouter);

app.use('/', websiteRouter);
app.use('/', testRouter);
app.use('/', searchRouter);

app.use('/app/api/v1', apiRouter);

app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, 'build')));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

// We will use two LocalStrategies, one for file-based auth and another for db-auth
passport.use('file-local', new LocalStrategy({
    usernameField: 'loginUsername', //useful for custom id's on your credentials fields, if incorrect you get a missing credentials error
    passwordField: 'loginPassword', //useful for custom id's on your credentials fields
  },
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false, {message: 'Incorrect username.'});
      }
      if (user.password != password) {
        return cb(null, false, {message: 'Incorrect password.'});
      }
      // If the credentials are valid, the verify callback invokes done to supply
      // Passport with the user that authenticated.
      return cb(null, user);
    });
  }));

passport.use('db-local', new LocalStrategy({
    usernameField: 'loginUsername', //useful for custom id's on your credentials fields, if this is incorrect you get a missing credentials error
    passwordField: 'loginPassword', //useful for custom id's on your credentials fields
  },
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false, {message: 'Incorrect username.'});
      }
      if (user.password != password) {
        return cb(null, false, {message: 'Incorrect password.'});
      }
      // If the credentials are valid, the verify callback invokes done to
      // supply Passport with the user that authenticated.
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
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


//home page
router.get('/', function (req, res) {
  res.render('index', {user: req.user, page_name: 'home'});
  //res.sendFile(path.join(__dirname+'/src/index.html')); //__dirname : It will resolve to your project folder.
});







//return template with scan results for produce
//NB this is an old template (scanresultv1) which probably should be removed
router.get('/scan/:id', function (req, res) {
  var supplierProduceID = req.params.id; //OranjezichtCityFarm_Apples
  var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false

  // http://localhost:3000/scan/OranjezichtCityFarm_Apples
  connection.execute('\n' +
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
    function (err, rows) {
      if (err) {
        //req.flash('error', err);
        console.error('error', err);
        res.render('scanresultv1', {
          data: '', user: req.user,
          showTracedOnBlockchain: boolTracedOnBlockchain,
          page_name: 'scanresultv1'
        });
      } else {
        res.render('scanresultv1', {
          data: rows, user: req.user,
          showTracedOnBlockchain: boolTracedOnBlockchain,
          page_name: 'scanresultv1'
        });
      }
    });
});




//TODO Add Weekly View route and template
//TODO Add Weekly View REST API







//addHarvest XmlHTTP request
router.post('/app/addHarvest', function (req, res) {
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
        req.body.ID,
        req.body.supplierID,
        req.body.supplierAddress,
        req.body.productID,
        req.body.photoHash,
        req.body.harvestTimeStamp,
        req.body.harvestCaptureTime,
        req.body.harvestDescription,
        req.body.geolocation,
        req.body.supplierproduce
      ], function (err, rows) {
        if (err) {
          //req.flash('error', err);
          console.error('error', err);
        } else {
          console.log('addHarvest DB success');
        }
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});

//addStorage XmlHTTP request
router.post('/app/addStorage', function (req, res) {
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
        req.body.ID,
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
      ], function (err, rows) {
        if (err) {
          console.error('error', err);
        } else {
          console.log('addStorage DB success');
        }
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});














// error handler
// to define an error-handling middleware, we simply define a middleware in our server.js with four arguments: err, req, res, and next.
// As long as we have these four arguments, Express will recognize the middleware as an error handling middleware
//Note that error handler must be the last middleware in chain, so it should be defined in the bottom of your application.js file after other app.use() and routes calls.
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
// render the error page
  res.status(err.status || 500);
  res.render('error', {user: req.user, page_name: 'error'});
});

// alternative error handlers based on mode
// app.configure('development', () => {
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// })

// app.configure('production', () => {
//   app.use(express.errorHandler())
// })

// app.listen(process.env.PORT || 3000);
//
// console.log('Running at Port 3000');

sequelise.authenticate().then(() => {
  console.log('Database connected...');
}).catch(err => {
  console.log('Error connecting to database: ' + err);
})

const PORT = process.env.PORT || 3000;
sequelise.sync().then(() => {
  app.listen(PORT, console.log(`Server started on port ${PORT}`));
}).catch(err => console.log("Error synching models: " + err));

