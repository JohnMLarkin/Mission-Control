const passport = require('passport'),
      express = require('express'),
      router = express.Router();

const Account = require('../models/account');

module.exports = {
  register(req, res) {
    res.render('register', {});
  },
  create(req, res) {
    Account.register(
      new Account({username: req.body.username, email: req.body.email}),
      req.body.password,
      (err, account) => {
        if (err) {
          if (err.name === 'UserExistsError')
          console.log(err);
          return res.render('register', {error: err.message});
        }
        passport.authenticate('local')(req, res, () => {
          req.session.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect('/');
          });
        });
      }
    );
  },
  logout(req, res) {
    req.logout();
    res.redirect('/');
  },
  login(req, res) {
    res.send('The login stub');
  }
};
