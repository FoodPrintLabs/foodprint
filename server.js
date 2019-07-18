const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const app = express();
const path = require('path');
const router = express.Router();


router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/src/index.html'));
  //__dirname : It will resolve to your project folder.
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
app.use(express.static('src'));
app.use(express.static('build'));
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');