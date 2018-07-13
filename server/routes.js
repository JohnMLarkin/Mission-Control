// Import Node packages
const express = require('express'),
      router = express.Router(),
      passport = require('passport');

// Import local scripts
const home = require('../controllers/home'),
      user = require('../controllers/user'),
      planning = require('../controllers/planning'),
      track = require('../controllers/track'),
      Account = require('../models/account');

module.exports = (app) => {
  router.get('/', home.index);

  // Authentication-related routes
  router.get('/register', user.register);
  router.post('/register', user.create);
  router.get('/login', user.login);
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  router.get('/logout', user.logout);
  router.get('/secure', user.secure);
  router.get('/manageUsers', user.manageUsers);
  router.post('/modifyUser', user.modifyUser);

  // Planning-related routes
  router.get('/createOrg', planning.showCreateOrg);
  router.post('/createOrg', planning.createOrg);
  router.get('/organizationList', planning.organizationList);
  router.post('/organizationList', planning.organizationList);

  router.get('/track/:mission_id', track.index);
  app.use(router);
}
