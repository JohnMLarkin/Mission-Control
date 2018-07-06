// Import necessary Node packages
const express = require('express'),
      mongoose = require('mongoose');

// Configure the express web server
const config = require('./server/configure');
let app = express();
app.set('port', process.env.PORT || 3300);
app.set('views', `${__dirname}/views`);
app = config(app);

// Mongoose start-up will go here

// Start the web server
const server = app.listen(app.get('port'), () => {
  console.log(`Local server up: http://localhost:${app.get('port')}`);
});
