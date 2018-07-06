// Import Node packages
const express = require('express'),
      router = express.Router();

// Import local scripts
const home = require('../controllers/home'),
      track = require('../controllers/track');

module.exports = (app) => {
  router.get('/', home.index);
  router.get('/track/:mission_id', track.index);
  app.use(router);
}
