var express = require('express');
var router = express.Router();
var passport = require('passport');


/* Render Login page. */
router.get('/login',
  function(req, res){
      if (req.user){
        res.redirect('/'); 
      } else{
        res.render('login', { title: 'FoodPrint - User Login', user:req.user, page_name:'login'});
      }
  });

/* Process Login form submission (File Based Auth). */
/* TODO add a user not found message */
router.post('/login', 
  passport.authenticate('file-local', { successReturnToOrRedirect: '/',
                                    successFlash : "You are now logged in.",
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
    req.flash('success', 'You are now logged out.');
    res.redirect('/app/auth/login');
  });


  /* Render Register page. */
router.get('/register/:message?',
function(req, res){
  req.params.message ?
  res.render('message', { title: 'FoodPrint - User Registration', user:req.user, page_name:'message', message:'Your registration has been submitted and is currently under review by the FoodPrint Team! You will be notified of status updates via the email you provided.'}):
  res.render('register', { title: 'FoodPrint - User Registration', user:req.user, page_name:'register'});
});

/* Process register form submission . */
router.post('/register', 
function(req, res){
  //TODO - Log registration to table and send email to FoodPrint Admin
  res.redirect('/app/auth/register/message');
});

module.exports = router;
