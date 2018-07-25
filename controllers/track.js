// Import local scripts
const secrets = require('../server/_secrets'),
      Mission = require('../models/mission').Mission,
      WayPoint = require('../models/waypoint'),
      accessControl = require('../helpers/accessControl');

module.exports = {
  index(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.usesGoogleMaps = true;
    ViewModel.usesSockets = true;
    ViewModel.usesCharts = true;
    ViewModel.GoogleMapsKey = secrets.GoogleMapsKey;
    ViewModel.trackJS = true;
    if (req.params.mission_id) {
      ViewModel.missionID = req.params.mission_id;
    }
    ViewModel.pastPath = [];
    Mission.findOne({missionID: req.params.mission_id}, (err, mission) => {
      if (err) {
        console.log('Error on Mission.findOne query');
        console.log(err);
      }
      WayPoint.find({missionObjectId: mission._id}, {}, {sort: {gpsTime: 1}}, (err, waypoints) => {
        for (let i = 0; i < waypoints.length; i++) {
          ViewModel.pastPath.push({lat: waypoints[i].lat, lng: waypoints[i].lng})
        }
        res.render('track', ViewModel);
      });
    });
  }
};
