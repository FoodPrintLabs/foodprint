var express = require('express');
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const CUSTOM_ENUMS = require("../src/js/enums");
var router = express.Router();
var initModels = require("../models/init-models");
var sequelise = require('../src/js/db_sequelise');

var models = initModels(sequelise);

//emailer configuration
let transporter = nodemailer.createTransport({
  service: CUSTOM_ENUMS.GMAIL,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
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
    var QRFullName = QRDirectory + QRFileName + ".png";
    QRFullName = QRFullName.trim();
    console.log('Wrote to ' + res2);
    res.json(res2);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
  }
});

//Test Email XmlHTTP request
router.post('/app/testemail', function (req, res) {
  let mailOptions = {
    to: process.env.TEST_EMAIL_ADDRESS,
    subject: "Test Email",
    html: "<h2>Welcome to FoodPrint</h2><p>This is a test email.</p>"
  };

  transporter.sendMail(mailOptions, function (error, data) {
    if (error) {
      console.log("Error sending email - ", error);
      res.status.json({err: error});
    } else {
      console.log("Email successfully sent - ", data);
      res.json({success: true});
    }
  });
});

module.exports = router;
