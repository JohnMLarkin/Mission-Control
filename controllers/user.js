const passport = require('passport'),
      express = require('express'),
      router = express.Router();

const Account = require('../models/account'),
      accessControl = require('../helpers/accessControl');

module.exports = {
  register(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    res.render('register', ViewModel);
  },
  create(req, res) {
    Account.register(
      new Account({username: req.body.username, email: req.body.email}),
      req.body.password,
      (err, account) => {
        if (err) {
          if (err.name === 'UserExistsError') {
            return res.render('register', {error: `Username ${req.body.username} already exists.`, email: req.body.email});
          } else {
            console.log(err);
          }
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
    var ViewModel = accessControl.navBarSupport(req.user);
    res.render('login', ViewModel);
  },
  manageUsers(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.onlyAdmin(req)) {
      ViewModel.accounts = [];
      Account.find({username: {$ne: req.user.username}}, {}, {sort: {username: 1}}, (err, accounts) => {
        if (err) {throw err};
        ViewModel.accounts = accounts;
        ViewModel.manageUsersJS = true;
        res.render('manageUsers', ViewModel);
      });
    } else {
      res.redirect('/login');
    }
  },
  modifyUser(req, res) {
    if (accessControl.onlyAdmin(req)) {
      console.log(req.body);
      if (req.body.userList) {
        Account.findOne({
          username: {$regex: req.body.userList}
        },
        (err, account) => {
          if (err) {throw err;}
          if ((account) && (account.username != req.user.username)) {
            if (req.body.userActionSelect === 'Change role') {
              account.role = req.body.roleSelect;
            }
            account.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect('/manageUsers');
            });
          }
        }
      )}
    } else {
      res.redirect('/login');
    }
  }
};
