// Import necessary Node packages
const express = require('express'),
      mongoose = require('mongoose'),
      socketio = require('socket.io'),
      fs = require('fs'),
      processSBD = require('./helpers/processSBD');

const secrets = require('./server/_secrets');

// Configure the express server
const config = require('./server/configure');
let app = express();
app.set('port', process.env.PORT || 3300);
app.set('views', `${__dirname}/views`);
app = config(app);

// Mongoose (MongoDB interface) start up
const uri = `mongodb+srv://${secrets.mongodb.username}:${secrets.mongodb.password}@cluster0-rv1vo.mongodb.net/test?retryWrites=true`;
mongoose.connect(uri);
mongoose.connection.on('open', () => {
  console.log('Connected to MongoDB');
})

// Start the web server
const server = app.listen(app.get('port'), () => {
  console.log(`Local server up: http://localhost:${app.get('port')}`);
});

/********************************************************
  Socket service for pushing data updates to browser
********************************************************/
// let timerId = null;  // for testing only
var sockets = new Set();
var io = socketio(server);

io.on('connection', (socket) => {
  sockets.add(socket);

  // for testing only
  // if (!timerId) {
  //   startTimer();
  // }

  socket.on('disconnect', () => {
    sockets.delete(socket);
  });

  socket.on('follow mission', (id) => {
    socket.missionID = id;
  });
});

// Start the Gmail subscription
processSBD.gmailListener(sockets);
