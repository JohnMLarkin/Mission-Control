// Import Node packages
const path = require('path'),
      express = require('express'),
      exphbs = require('express-handlebars'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      logger = require('morgan'),
      methodOverride = require('method-override'),
      errorHandler = require('errorhandler'),
      moment = require('moment'),
      multer = require('multer'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      mongoose = require('mongoose'),
      session = require('express-session'),
      favicon = require('serve-favicon');

// Import local scripts
const routes = require('./routes');
const secrets = require('./_secrets');

module.exports = (app) => {
  // Provides an icon for use by browsers
  // app.use(favicon(__dirname + '/public/favicon.ico'));

  // Logs HTTP requests
  app.use(logger('dev'));

  // Add HTML body parsers for incoming requests
  app.use(bodyParser.urlencoded({'extended': true}));
  app.use(bodyParser.json());

  // View engine setup
  app.engine('handlebars', exphbs.create({
    defaultLayout: 'main',
    layoutsDir: `${app.get('views')}/layouts`,
    partialsDir: `${app.get('views')}/partials`,
    helpers: {
      timeago: (timestamp) => {
        return moment(timestamp).startOf('minute').fromNow();
      },
      json: (content) => {
        return JSON.stringify(content);
      },
      unlessEqual: (v1, v2, options) => {
        if (v1 === v2) {
          return options.inverse(this);
        }
        return options.fn(this);
      }
    }
  }).engine);
  app.set('view engine','handlebars');

  app.use(methodOverride());
  app.use(cookieParser(secrets.cookie));

  // Enable authenticated sessions
  app.use(session({
    secret: secrets.cookie,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());


  routes(app);
  app.use('/public/', express.static(path.join(__dirname, '../public')));

  // Configure Passport
  var Account = require('../models/account');
  passport.use(new LocalStrategy(Account.authenticate()));
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());

  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }

  return app;
}
