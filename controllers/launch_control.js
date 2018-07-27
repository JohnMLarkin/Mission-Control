const Mission = require('../models/mission').Mission;

module.exports = {
  verifyLaunchCode(req, res) {
    let codesMatch = false;
    console.log('Launch code verification request received');
    console.log('Mission ID: ' + req.params.mission_id);
    console.log('Tested code: ' + req.body.launchCode);
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {throw err;}
        if (mission) {
          if (mission.launchCode == req.body.launchCode) codesMatch = true;
        }
        if (codesMatch) {
          res.send('VERIFIED');
        } else {
          res.send('DENIED');
        }
      }
    );
  }
}
