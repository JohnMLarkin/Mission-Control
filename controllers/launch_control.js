const Mission = require('../models/mission').Mission;

module.exports = {
  verifyLaunchCode(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send('DB ACCESS ERROR');
          console.log(err);
        } else if (mission) {
          if (mission.launchCode == req.body.launchCode) {
            if (mission.status == 'archived') {
              res.status(403).send('Mission is archived and may not be altered');
            } else {
              res.send('VERIFIED');
            }
          } else {
            res.send('DENIED');
          }
        } else {
          res.status(404).send('Mission not found');
        }
      }
    );
  },
  getManifest(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send(err);
        }
        if (mission) {
          manifest = mission.podManifest;
          res.send(JSON.stringify(manifest));
        } else {
          res.status(404).send('Mission not found');
        }

      }
    );
  },
  setManifest(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send('DB ACCESS ERROR');
        }
        if (mission) {
          if (mission.launchCode == req.body.launchCode) {
            if (mission.status == 'archived') {
              res.status(403).send('Mission is archived and may not be altered');
            } else {
              let manifest = req.body.manifest;
              mission.podManifest = JSON.parse(manifest);
              mission.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.send('UPDATE OK');
              });
            }
          } else {
            res.status(401).send('Incorrect launch code');
          }
        } else {
          res.status(404).send('Mission not found');
        }
      }
    );
  },
  verifyActiveStatus(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send('DB ACCESS ERROR');
          console.log(err);
        } else if (mission) {
          res.send(mission.status);
        } else {
          res.status(404).send('Mission not found');
        }
      }
    );
  },
  setStatusActive(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send('DB ACCESS ERROR');
        }
        if (mission) {
          if (mission.launchCode == req.body.launchCode) {
            if (mission.status == 'archived') {
              res.status(403).send('Mission is archived and may not be altered');
            } else {
              mission.status = 'active';
              mission.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.send('UPDATE OK');
              });
            }
          } else {
            res.status(401).send('Incorrect launch code');
          }
        } else {
          res.status(404).send('Mission not found');
        }
      }
    );
  },
  setStatusPlanned(req, res) {
    Mission.findOne({missionID: req.params.mission_id},
      (err, mission) => {
        if (err) {
          res.status(404).send('DB ACCESS ERROR');
        }
        if (mission) {
          if (mission.launchCode == req.body.launchCode) {
            if (mission.status == 'archived') {
              res.status(403).send('Mission is archived and may not be altered');
            } else {
              mission.status = 'planned';
              mission.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.send('UPDATE OK');
              });
            }
          } else {
            res.status(401).send('Incorrect launch code');
          }
        } else {
          res.status(404).send('Mission not found');
        }
      }
    );
  }
}
