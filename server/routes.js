// Import Node packages
const express = require('express'),
      router = express.Router(),
      passport = require('passport');

// Import local scripts
const home = require('../controllers/home'),
      user = require('../controllers/user'),
      planning = require('../controllers/planning'),
      track = require('../controllers/track'),
      launch_control = require('../controllers/launch_control'),
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
  router.get('/manageUsers', user.manageUsers);
  router.post('/modifyUser', user.modifyUser);

  // Planning-related routes
  router.get('/createOrg', planning.showCreateOrg);
  router.post('/createOrg', planning.createOrg);
  router.get('/organizationList', planning.organizationList);
  router.post('/organizationList', planning.organizationList);
  router.get('/createMission', planning.createMission);
  router.post('/addMission', planning.addMission);
  router.get('/plannedOverview/:mission_id', planning.plannedOverview);
  router.get('/manageMissions', planning.manageMissions);
  router.post('/modifyMission', planning.modifyMission);
  router.get('/createAnnouncement', planning.createAnnouncement);
  router.post('/addAnnouncement', planning.addAnnouncement);
  router.get('/manageAnnouncements', planning.manageAnnouncements);
  router.post('/modifyAnnouncement', planning.modifyAnnouncement);

  // Navigation-related routes
  router.get('/controlPanel', home.controlPanel);

  // Mission-related routes
  router.get('/track/:mission_id', track.index);
  router.get('/review/:mission_id', track.review);
  router.post('/download/:mission_id', track.download);

  // Launch control communication routes
  router.post('/verifyLaunchCode/:mission_id', launch_control.verifyLaunchCode);
  router.get('/getManifest/:mission_id', launch_control.getManifest);
  router.put('/setManifest/:mission_id', launch_control.setManifest);
  router.get('/verifyActiveStatus/:mission_id', launch_control.verifyActiveStatus);
  router.put('/setStatusActive/:mission_id', launch_control.setStatusActive);
  router.put('/setStatusPlanned/:mission_id', launch_control.setStatusPlanned);

  app.use(router);
}
