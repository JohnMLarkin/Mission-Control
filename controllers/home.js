const accessControl = require('../helpers/accessControl'),
      Organization = require('../models/organization'),
      Mission = require('../models/mission').Mission,
      Announcement = require('../models/announcement');

// const homeSidebar = require('../helpers/homeSidebar'),
//       MissionModel = require('../models').Mission;

module.exports = {
  index(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.activeMissions = [];
    ViewModel.plannedMissions = [];
    ViewModel.archivedMissions = [];
    Organization.find({}, {}, {}, (err, organizations) => {
      var orgDict = {};
      for (let i=0; i<organizations.length; i++) {
        orgDict[organizations[i]._id] = organizations[i].name;
      }
      Mission.find({}, {}, {sort: {launchDate: -1}}, (err, missions) => {
        for (let i = 0; i < missions.length; i++) {
          missions[i].orgName = orgDict[missions[i].organizationID];
          missions[i].formattedLaunchDate = missions[i].launchDate.toISOString().substring(0, 10);
          switch (missions[i].status) {
            case 'planned':
              ViewModel.plannedMissions.push(missions[i]);
              break;
            case 'active':
              ViewModel.activeMissions.push(missions[i]);
              break;
            case 'archived':
              ViewModel.archivedMissions.push(missions[i]);
              break;
            default:
              console.log('Error: unexpected mission status');
          }
        }
        ViewModel.plannedMissions.reverse();
        ViewModel.activeMissions.reverse();
        var now = Date.now();
        Announcement.find({
          $or: [
            {expires: false},
            {$and: [{expires: true}, {expireDate: {$gte: now}}]}
           ]
         }, {}, {}, (err, announcements) => {
          if (err) {throw err};
          ViewModel.announcements = announcements;
          res.render('home', ViewModel);
        });
      });
    });
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
