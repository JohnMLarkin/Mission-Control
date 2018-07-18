// Import necessary Node packages
const express = require('express'),
      mongoose = require('mongoose'),
      socketio = require('socket.io'),
      fs = require('fs'),
      watch = require('watch');

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
let timerId = null;  // for testing only
let sockets = new Set();
var io = socketio(server);

io.on('connection', (socket) => {
  sockets.add(socket);

  // for testing only
  if (!timerId) {
    startTimer();
  }

  socket.on('disconnect', () => {
    sockets.delete(socket);
  });

  socket.on('follow mission', (id) => {
    socket.missionID = id;
  });
});

// For socket testing only
// Deployed version will call on incoming SBD message
var fakeLng = -118;
var fakeAlt = 0;

function startTimer() {
  timerId = setInterval(() => {
    if (!sockets.size) {
      clearInterval(timerId);
      timerId = null;
      fakeLng = -118;
      fakeAlt = 0;
    }

    var fakeLat = 0.5*Math.sin(fakeLng) + 47.0;
    var fakeTime = Date.now();
    var fakeMissionID = 1;
    for (const s of sockets) {
      if (s.missionID == fakeMissionID) {
        s.emit('waypoint', {
          lat: fakeLat,
          lng: fakeLng,
          isGPSlocked: (fakeLat>47),
          alt: fakeAlt,
          updateTime: fakeTime
        });
      }
    }
    fakeLng = fakeLng + 0.05;
    fakeAlt = fakeAlt + 30;
  }, 6000)
}

/********************************************************
  File system monitor for incoming SBD messages
********************************************************/
watch.createMonitor('./sbd/incoming', { interval: 30 },
  function(monitor) {
    monitor.on("created", function (f, stat) {
      console.log(f + " created");
    });
  }
);
