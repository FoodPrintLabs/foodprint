var express = require('express');
var router = express.Router();

/*Render user_management */
router.get('/', function (req, res) {
  res.render('dashboard_farmer', {
    title: 'FoodPrint - Farmer Dashboard',
    user: req.user,
    page_name: 'Dashboard',
  });
});

//TODO
//GET ALL LOGGED IN FARMER CROPS

//GET AMOUNT FOR EACH CROP (PASS PARAMETER)

module.exports = router;
