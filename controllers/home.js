// const homeSidebar = require('../helpers/homeSidebar'),
//       MissionModel = require('../models').Mission;

module.exports = {
  index: (req, res) => {
    if (req.user) {
      res.send(`You are currently logged in as ${req.user.username} with ${req.user.role} role`);
    } else {
      res.send('You should login or register');
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
