const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const app = express();
const path = require('path');
const router = express.Router();

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

//return template with scan results for produce
router.get('/scan/:id',function(req,res){
  const supplierProduceID = req.params.id;
  //TODO write a function that takes the supplierProduceID e.g. OranjezichtCityFarm_Apples
  //and returns the farm profile, harvest and storage id
  res.sendFile(path.join(__dirname+'/src/scanresult.html'));
});

router.get('/qrcode', async (req, res, next) => {
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

    //fs.writeFileSync(QRFullName, '<img src="${res2}">');
  //console.log('Wrote to ' + QRFullName);


    // // Generate QR Code from text
    // var qr_png = qr.imageSync(qr_txt,{ type: 'png'})
    // // Generate a random file name
    // let qr_code_file_name = new Date().getTime() + '.png';
    //
    // fs.writeFileSync('./public/qr/' + qr_code_file_name, qr_png, (err) => {
    //
    //     if(err){
    //         console.log(err);
    //     }
    //
    // })
    // // Send the link of generated QR code
    // res.send({
    //     'qr_img': "qr/" + qr_code_file_name
    // });

  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});


// router.get('/about',function(req,res){
//   res.sendFile(path.join(__dirname+'/about.html'));
// });
//
// router.get('/sitemap',function(req,res){
//   res.sendFile(path.join(__dirname+'/sitemap.html'));
// });

//add the router
app.use('/', router);
//app.use(express.static('src'));
app.use(cors());
app.use(express.static(path.join(__dirname,"src")));
app.use(express.static('build'));
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

