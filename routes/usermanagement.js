var express = require('express');
var router = express.Router();

/*Render user_management */
router.get('/user_management', function (req, res) {
  res.render('user_management', {
    title: 'FoodPrint - User management',
    user: req.user,
    page_name: 'UMS',
  });
});

module.exports = router;
