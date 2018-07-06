const async = require('async');

const Missions = require('./missions');

module.exports = (ViewModel, callback) => {
  async.parallel([
    (next) => {
      Missions.active(next);
    },
    (next) => {
      Missions.recent(next);
    },
    (next) => {
      Missions.planned(next);
    }
  ], (err,results) => {
    ViewModel.sidebar = {
      active: results[0],
      recent: results[1],
      planned: results[2]
    };
    callback(ViewModel);
  });
};
