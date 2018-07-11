// Import necessary Node packages
const express = require('express'),
      mongoose = require('mongoose');

const secrets = require('./server/_secrets');

// Configure the express web server
const config = require('./server/configure');
let app = express();
app.set('port', process.env.PORT || 3300);
app.set('views', `${__dirname}/views`);
app = config(app);

// Mongoose start-up will go here
const uri = `mongodb+srv://${secrets.mongodb.username}:${secrets.mongodb.password}@cluster0-rv1vo.mongodb.net/test?retryWrites=true`;
mongoose.connect(uri);
mongoose.connection.on('open', () => {
  console.log('Mongoose connected.');
})


// Start the web server
const server = app.listen(app.get('port'), () => {
  console.log(`Local server up: http://localhost:${app.get('port')}`);
});
