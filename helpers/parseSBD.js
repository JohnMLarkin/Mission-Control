const Mission = require('../models/mission').Mission,
      WayPoint = require('../models/waypoint');

function sbdToWaypoint(sbd, msgNum) {
  if (sbd.length >= 27) {
    var r = {};
    var rawID = sbd.readInt16LE(0);
    r.missionID = Math.abs(rawID);
    r.inFlight = rawID > 0;
    var bitByte = sbd.readUInt8(2);
    r.isGPSfixValid = bitByte & 1;
    var headingSign = bitByte & 2;
    r.isPodActive = [];
    for (let i = 0; i < 6; i++) {
      r.isPodActive[i] = bitByte & Math.pow(2,i+2);
    }
    r.gpsTime = new Date();
    r.gpsTime.setTime(sbd.readInt32LE(3)*1000);
    r.lat = sbd.readInt32LE(7)/100000/60;
    r.lng = sbd.readInt32LE(11)/100000/60;
    r.alt = sbd.readUInt16LE(15);
    r.vertVel = sbd.readInt16LE(17)*0.1;
    r.gndSpeed = sbd.readUInt16LE(19)*0.1;
    r.heading = sbd.readUInt8(21);
    if (!headingSign) r.heading = -r.heading;
    r.cmdBatteryVoltage = sbd.readUInt8(22)*0.05;
    r.intTemp = sbd.readInt16LE(23)*0.01;
    r.extTemp = sbd.readInt16LE(25)*0.01;
    if (sbd.length > 27) {
      r.podData = Buffer.allocUnsafe(sbd.length-27);
      sbd.copy(r.podData, 0, 27, sbd.length);
    }
    Mission.findOne({missionID: missionID},
      (err, mission) => {
        if (err) {throw err;}
        var newWaypoint = new WayPoint({
          momsn: msgNum,
          missionObjectId: mission._id,
          inFlight: r.inFlight,
          isGPSfixValid: r.isGPSfixValid,
          isPodActive: r.isPodActive,
          gpsTime: r.gpsTime,
          lat: r.lat,
          lng: r.lng,
          alt: r.alt,
          vertVel: r.vertVel,
          gndSpeed: r.gndSpeed,
          heading: r.heading,
          cmdBatteryVoltage: r.cmdBatteryVoltage,
          intTemp: r.intTemp,
          extTemp: r.extTemp,
          podData: r.podData
        });
        newWaypoint.save((err, waypoint) => {
          // update something?
        });
      }
    );
  }

}
