const json2csv = require('json2csv').parse;

// Import local scripts
const secrets = require('../server/_secrets'),
      Mission = require('../models/mission').Mission,
      Organization = require('../models/organization'),
      WayPoint = require('../models/waypoint'),
      accessControl = require('../helpers/accessControl');

module.exports = {
  index(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.usesGoogleMaps = true;
    ViewModel.usesSockets = true;
    ViewModel.usesCharts = true;
    ViewModel.usesGauges = true;
    ViewModel.GoogleMapsKey = secrets.GoogleMapsKey;
    ViewModel.trackJS = true;
    if (req.params.mission_id) {
      ViewModel.missionID = req.params.mission_id;
    }
    ViewModel.pastPath = [];
    ViewModel.pastAlt = [];
    ViewModel.pastBatt = [];
    ViewModel.pastIntTemp = [];
    ViewModel.pastExtTemp = [];
    Mission.findOne({missionID: req.params.mission_id}, (err, mission) => {
      if (err) {
        res.status(404).send(err);
        console.log(err);
      } else {
        if (mission) {
          WayPoint.find({missionObjectId: mission._id}, {}, {sort: {gpsTime: 1}}, (err, waypoints) => {
            for (let i = 0; i < waypoints.length; i++) {
              ViewModel.pastPath.push({lat: waypoints[i].lat, lng: waypoints[i].lng});
              ViewModel.pastAlt.push({x: waypoints[i].gpsTime, y: waypoints[i].alt});
              ViewModel.pastBatt.push({x: waypoints[i].gpsTime, y: waypoints[i].cmdBatteryVoltage});
              ViewModel.pastIntTemp.push({x: waypoints[i].gpsTime, y: waypoints[i].intTemp});
              ViewModel.pastExtTemp.push({x: waypoints[i].extTemp, y: waypoints[i].alt});
            }
            if (waypoints.length > 0) {
              ViewModel.mostRecent = {
                updateTime: waypoints[waypoints.length-1].gpsTime.toLocaleTimeString(),
                alt: waypoints[waypoints.length-1].alt + ' m',
                vertVel: waypoints[waypoints.length-1].vertVel.toFixed(1) + ' m/s',
                gndSpeed: waypoints[waypoints.length-1].gndSpeed.toFixed(1) + ' km/h',
                lat: waypoints[waypoints.length-1].lat.toFixed(5) + '\xB0',
                lng: waypoints[waypoints.length-1].lng.toFixed(5) + '\xB0',
                intTemp: waypoints[waypoints.length-1].intTemp.toFixed(1) + '\xB0C',
                extTemp: waypoints[waypoints.length-1].extTemp.toFixed(1) + '\xB0C',
              }
              ViewModel.mapCenterLat = waypoints[waypoints.length-1].lat;
              ViewModel.mapCenterLng = waypoints[waypoints.length-1].lng;
              ViewModel.startHeading = waypoints[waypoints.length-1].heading;
              ViewModel.startBattery = waypoints[waypoints.length-1].cmdBatteryVoltage;
            } else {
              ViewModel.mapCenterLat = 47.65889;
              ViewModel.mapCenterLng = -117.425;
              ViewModel.startHeading = 0;
              ViewModel.startBattery = 5;
            }
            res.render('track', ViewModel);
          });
        } else {
          res.status(404).send(err);
        }
      }
    });
  },
  review(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.usesGoogleMaps = true;
    ViewModel.usesCharts = true;
    ViewModel.GoogleMapsKey = secrets.GoogleMapsKey;
    ViewModel.reviewJS = true;
    if (req.params.mission_id) {
      ViewModel.missionID = req.params.mission_id;
    }
    ViewModel.flightPath = [];
    ViewModel.altVsTime = [];
    ViewModel.vertVelVsTime = [];
    ViewModel.gndSpeedVsAlt = [];
    ViewModel.headingVsAlt = [];
    ViewModel.battVsTime = [];
    ViewModel.intTempVsTime = [];
    ViewModel.extTempVsAlt = [];
    Mission.findOne({missionID: req.params.mission_id}, (err, mission) => {
      if (err) {
        res.status(404).send(err);
        console.log(err);
      } else {
        if (mission) {
          ViewModel.missionDescription = mission.description;
          ViewModel.formattedLaunchDate = mission.launchDate.toDateString();
          Organization.findById(mission.organizationID, (err, org) => {
            ViewModel.orgName = org.name;
            WayPoint.find({missionObjectId: mission._id}, {}, {sort: {gpsTime: 1}}, (err, waypoints) => {
              ViewModel.peakAlt = 0;
              for (let i = 0; i < waypoints.length; i++) {
                ViewModel.flightPath.push({lat: waypoints[i].lat, lng: waypoints[i].lng});
                ViewModel.altVsTime.push({x: waypoints[i].gpsTime, y: waypoints[i].alt});
                ViewModel.vertVelVsTime.push({x: waypoints[i].gpsTime, y: waypoints[i].vertVel});
                ViewModel.gndSpeedVsAlt.push({x: waypoints[i].gndSpeed, y: waypoints[i].alt});
                ViewModel.headingVsAlt.push({x: waypoints[i].heading, y: waypoints[i].alt});
                ViewModel.battVsTime.push({x: waypoints[i].gpsTime, y: waypoints[i].cmdBatteryVoltage});
                ViewModel.intTempVsTime.push({x: waypoints[i].gpsTime, y: waypoints[i].intTemp});
                ViewModel.extTempVsAlt.push({x: waypoints[i].extTemp, y: waypoints[i].alt});
                if (waypoints[i].alt > ViewModel.peakAlt) ViewModel.peakAlt = waypoints[i].alt;
              }
              if (waypoints.length > 0) {
                ViewModel.mapCenterLat = (waypoints[waypoints.length-1].lat + waypoints[0].lat)/2;
                ViewModel.mapCenterLng = (waypoints[waypoints.length-1].lng + waypoints[0].lng)/2;
                let ft = waypoints[waypoints.length-1].gpsTime - waypoints[0].gpsTime;
                ViewModel.duration = (ft/1000/60).toFixed(0);
              } else {
                ViewModel.mapCenterLat = 47.65889;
                ViewModel.mapCenterLng = -117.425;
              }
              res.render('review', ViewModel);
            });
          });
        } else {
          res.status(404).send(err);
        }
      }
    });
  },
  download(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    Mission.findOne({missionID: req.params.mission_id}, (err, mission) => {
      if (err) {
        console.log('Error on Mission.findOne query');
        console.log(err);
      } else {
        if (mission) {
          WayPoint.find({missionObjectId: mission._id}, {}, {sort: {gpsTime: 1}}, (err, waypoints) => {
            flightData = [];
            for (let i = 0; i < waypoints.length; i++) {
              flightData.push({
                Time: waypoints[i].gpsTime.toLocaleString().replace(',',''),
                'Altitude (m)': waypoints[i].alt,
                Latitude: waypoints[i].lat,
                Longitude: waypoints[i].lng,
                'Vertical Velocity (m/s)': waypoints[i].vertVel,
                'Ground Speed (km/h)': waypoints[i].gndSpeed,
                Heading: waypoints[i].heading,
                'Battery Voltage (V)': waypoints[i].cmdBatteryVoltage,
                'Internal Temperature (C)': waypoints[i].intTemp,
                'External Temperature (C)': waypoints[i].extTemp
              });
            }
            var fields = [];
            if (req.body.timeField) fields.push('Time');
            if (req.body.altitudeField) fields.push('Altitude (m)');
            if (req.body.latLngField) {
              fields.push('Latitude');
              fields.push('Longitude');
            }
            if (req.body.vertVelField) fields.push('Vertical Velocity (m/s)');
            if (req.body.gndSpeedField) fields.push('Ground Speed (km/h)');
            if (req.body.headingField) fields.push('Heading');
            if (req.body.cmdBatteryVoltageField) fields.push('Battery Voltage (V)');
            if (req.body.intTempField) fields.push('Internal Temperature (C)');
            if (req.body.extTempField) fields.push('External Temperature (C)');
            const opts = { fields };
            const csv = json2csv(flightData, opts);
            console.log(csv);
            res.setHeader('Content-disposition', `attachment; filename=Mission_${req.params.mission_id}_data.csv`);
            res.setHeader('Content-type', 'text/csv');
            res.send(csv);
          });
        } else {
          res.status(404).send(err);
        }
      }
    });
  }
};
