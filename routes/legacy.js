var express = require('express');
var router = express.Router();
var connection = require('../src/js/db');

//return template with scan results for produce
//NB this is an old template (scanresultv1) which probably should be removed
router.get('/scan/:id', function (req, res) {
  var supplierProduceID = req.params.id; //OranjezichtCityFarm_Apples
  var boolTracedOnBlockchain = process.env.SHOW_TRACED_ON_BLOCKCHAIN || false;

  // http://localhost:3000/scan/OranjezichtCityFarm_Apples
  connection.execute(
    '\n' +
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
    [supplierProduceID, supplierProduceID, supplierProduceID],
    function (err, rows) {
      if (err) {
        //req.flash('error', err);
        console.error('error', err);
        res.render('scanresultv1', {
          data: '',
          user: req.user,
          showTracedOnBlockchain: boolTracedOnBlockchain,
          page_name: 'scanresultv1',
        });
      } else {
        res.render('scanresultv1', {
          data: rows,
          user: req.user,
          showTracedOnBlockchain: boolTracedOnBlockchain,
          page_name: 'scanresultv1',
        });
      }
    }
  );
});

//TODO Add Weekly View route and template
//TODO Add Weekly View REST API

//addHarvest XmlHTTP request
router.post('/app/addHarvest', function (req, res) {
  // ID ,supplierID,supplierAddress,productID,photoHash,harvestTimeStamp,harvestCaptureTime,harvestDescription,
  // geolocation,supplierproduce
  // console.log("addHarvest" + req.body);
  try {
    connection.query(
      '\n' +
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
        req.body.supplierproduce,
      ],
      function (err, rows) {
        if (err) {
          //req.flash('error', err);
          console.error('error', err);
        } else {
          console.log('addHarvest DB success');
        }
      }
    );
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e);
  }
});

//addStorage XmlHTTP request
router.post('/app/addStorage', function (req, res) {
  // ID,marketID,marketAddress,quantity,unitOfMeasure,storageTimeStamp,storageCaptureTime,URL,hashID,
  // storageDescription,geolocation,supplierproduce

  // console.log("addStorage" + req.body);
  try {
    connection.query(
      'INSERT INTO storage (\n' +
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
        req.body.supplierproduce,
      ],
      function (err, rows) {
        if (err) {
          console.error('error', err);
        } else {
          console.log('addStorage DB success');
        }
      }
    );
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e);
  }
});

//supply chain - harvest and storage
router.get(
  '/app/supplychain',
  require('connect-ensure-login').ensureLoggedIn({
    redirectTo: '/app/auth/login',
  }),
  function (req, res) {
    res.render('supplychain', { user: req.user, page_name: 'supplychain' });
  }
);

module.exports = router;
