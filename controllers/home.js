const accessControl = require('../helpers/accessControl');

// const homeSidebar = require('../helpers/homeSidebar'),
//       MissionModel = require('../models').Mission;

module.exports = {
  index(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    res.render('home', ViewModel);
  },
  controlPanel(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      res.render('controlPanel', ViewModel);
    } else {
      res.redirect('/');
    }
  }
  // index: (req, res) => {
  //   const ViewModel = {
  //     missions: []
  //   };
  //   MissionModel.find({}, {}, {sort: {timestamp: -1}}, (err, missions) => {
  //     if (err) {throw err;}
  //     ViewModel.missions = missions;
  //     homeSidebar(ViewModel, (ViewModel) => {
  //       res.render('home', ViewModel);
  //     });
  //   });
  // }
};
