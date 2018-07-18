// Import local scripts
const secrets = require('../server/_secrets'),
      accessControl = require('../helpers/accessControl');

module.exports = {
  index(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.usesGoogleMaps = true;
    ViewModel.usesSockets = true;
    ViewModel.GoogleMapsKey = secrets.GoogleMapsKey;
    ViewModel.trackJS = true;
    if (req.params.mission_id) {
      ViewModel.missionID = req.params.mission_id;
    }
    res.render('track', ViewModel);
  }
};
