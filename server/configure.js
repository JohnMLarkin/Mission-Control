// Import Node packages
const path = require('path'),
      express = require('express'),
      exphbs = require('express-handlebars'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      morgan = require('morgan'),
      methodOverride = require('method-override'),
      errorHandler = require('errorhandler'),
      moment = require('moment'),
      multer = require('multer');

// Import local scripts
const routes = require('./routes');

module.exports = (app) => {
  app.use(morgan('dev'));   // Logs HTTP requests

  // Add HTML body parsers for incoming requests
  app.use(bodyParser.urlencoded({'extended': true}));
  app.use(bodyParser.json());

  app.engine('handlebars', exphbs.create({
    defaultLayout: 'main',
    layoutsDir: `${app.get('views')}/layouts`,
    partialsDir: `${app.get('views')}/partials`,
    helpers: {
      timeago: (timestamp) => {
        return moment(timestamp).startOf('minute').fromNow();
      }
    }
  }).engine);
  app.set('view engine','handlebars');

  app.use(methodOverride());
  app.use(cookieParser('MissionControl20180706'));

  routes(app);
  app.use('/public/', express.static(path.join(__dirname, '../public')));

  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }

  return app;
}
