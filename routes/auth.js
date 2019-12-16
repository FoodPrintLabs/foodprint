var express = require('express');
var router = express.Router();
var passport = require('passport');


/* Render Login page. */
router.get('/login',
  function(req, res){
      if (req.user){
        res.redirect('/'); 
      } else{
        res.render('login', { title: 'FoodPrint - User Login', user:req.user});
      }
  });

/* Process Login form submission (File Based Auth). */
/* TODO add a user not found message */
router.post('/login', 
  passport.authenticate('file-local', { successReturnToOrRedirect: '/',
                                    failureRedirect: '/app/auth/login', 
                                    failureFlash: true }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Process  Login form submission (DB Based Auth). */
/* TODO add a user not found message */
router.post('/dblogin', 
  passport.authenticate('db-local', {  successReturnToOrRedirect: '/',
                                    failureRedirect: '/app/auth/login', 
                                    failureFlash: true }) //instruct Passport to flash an error message using the message given by the strategy's verify callback, if any
);

/* Logout. */
router.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/app/auth/login');
  });

module.exports = router;
