// Import Node packages
const express = require('express'),
      router = express.Router(),
      passport = require('passport');

// Import local scripts
const home = require('../controllers/home'),
      user = require('../controllers/user'),
      track = require('../controllers/track'),
      Account = require('../models/account');

module.exports = (app) => {
  router.get('/', home.index);

  // Authentication-related routes
  router.get('/register', user.register);
  router.post('/register', user.create);
  router.get('/login', user.loginForm);
  router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
   function(req, res) {
     res.redirect('/')
   });
  router.get('/logout', user.logout);

  router.get('/track/:mission_id', track.index);
  app.use(router);
}
