const Mission = require('../models/mission').Mission,
      WayPoint = require('../models/waypoint'),
      GmailClient = require('../server/GmailClient'),
      PubSub = require('@google-cloud/pubsub');

const gmail = new GmailClient.GmailClient();
const pubsub = new PubSub();
const subscriptionName = 'projects/mission-control-whitworth/subscriptions/sbdSub';
const subscription = pubsub.subscription(subscriptionName);

async function gmailListener(sockets) {
  await gmail.authorize();
  gmail.watchInbox(`projects/mission-control-whitworth/topics/incomingSBD`);
  subscription.on(`message`, function (subUpdate) {
    checkEmail(subUpdate, sockets);
  });
}

function sbdToWaypoint(sbd, msgNum, sockets) {
  if (sbd.length >= 27) {
    var r = {};
    var rawID = sbd.readInt16BE(0);
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
    r.gpsTime.setTime(sbd.readInt32BE(3)*1000);
    r.lat = sbd.readInt32BE(7)/100000/60;
    r.lng = sbd.readInt32BE(11)/100000/60;
    r.alt = sbd.readUInt16BE(15);
    r.vertVel = sbd.readInt16BE(17)*0.1;
    r.gndSpeed = sbd.readUInt16BE(19)*0.1;
    r.heading = sbd.readUInt8(21);
    if (!headingSign) r.heading = -r.heading;
    r.cmdBatteryVoltage = sbd.readUInt8(22)*0.05;
    r.intTemp = sbd.readInt16BE(23)*0.01;
    r.extTemp = sbd.readInt16BE(25)*0.01;
    if (sbd.length > 27) {
      r.podData = Buffer.allocUnsafe(sbd.length-27);
      sbd.copy(r.podData, 0, 27, sbd.length);
    }
    Mission.findOne({missionID: r.missionID},
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
          for (const s of sockets) {
            if (s.missionID == r.missionID) {
              s.emit('waypoint', {
                lat: waypoint.lat,
                lng: waypoint.lng,
                isGPSlocked: waypoint.isGPSfixValid,
                alt: waypoint.alt,
                updateTime: waypoint.gpsTime,
                heading: waypoint.heading,
                cmdBatteryVoltage: waypoint.cmdBatteryVoltage,
                intTemp: waypoint.intTemp,
                extTemp: waypoint.extTemp,
                vertVel: waypoint.vertVel,
                gndSpeed: waypoint.gndSpeed
              });
            }
          }
        });
      }
    );
  }
}

async function checkEmail(subUpdate, sockets) {
  let messages = await gmail.listMessages();
  if (messages) {
    while (messages.length>0) {
      let msgId = messages.pop().id;
      let msg = await gmail.getMessage(msgId);
      let mail = GmailClient.parseMessage(msg);
      if (mail.from.address === 'sbdservice@sbd.iridium.com') {
        var msgInfo = {};
        var splitByLines = mail.textPlain.split('\r\n');
        for (let i = 0; i < splitByLines.length; i++) {
          let x = splitByLines[i];
          if (x.length>1) {
            let y = x.split(': ');
            switch (y[0]) {
              case 'MOMSN':
                msgInfo.momsn = Number(y[1]);
                break;
              case 'Session Status':
                msgInfo.sessionStatus = y[1];
                break;
              case 'Message Size (bytes)':
                msgInfo.msgSize = Number(y[1]);
                break;
            }
          }
        }
        if (mail.attachments) {
          sbd = await gmail.getAttachment(msgId, mail.attachments[0].attachmentId);
          sbdToWaypoint(sbd, msgInfo.momsn, sockets);
        }
        gmail.markRead(msgId);
      }
    }
  }
  subUpdate.ack();
}

module.exports.sbdToWaypoint = sbdToWaypoint;
module.exports.checkEmail = checkEmail;
module.exports.gmailListener = gmailListener;
