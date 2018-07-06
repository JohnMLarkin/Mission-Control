// const homeSidebar = require('../helpers/homeSidebar'),
//       MissionModel = require('../models').Mission;

module.exports = {
  index: (req, res) => {
    res.send('The home:index controller');
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
