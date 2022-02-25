var express = require('express');
var router = express.Router();

/*Render user_management */
router.get('/', function (req, res) {
  res.render('dashboard_admin', {
    title: 'FoodPrint - Admin Dashboard',
    user: req.user,
    page_name: 'Dashboard',
  });
});

//TODO
//GET ALL CROPS HARVESTED

//GET TOTAL AMOUNT FOR EACH CROP (PASS PARAMETER)

//GET TOTAL AMOUNT FOR EACH FARMER (PASS PARAMETERS)

module.exports = router;
