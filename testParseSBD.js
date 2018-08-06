fs = require('fs');

fs.readFile('fakeSBD.dat', (err, data) => {
  if (err) {
    console.log(err);
    throw err
  }
  sbdLength = data.length;
  if (sbdLength >= 27) {
    missionID = data.readInt16LE(0);
    bitByte = data.readUInt8(2);
    gpsFix = bitByte & 1;
    headingSign = bitByte & 2;
    podActive = [];
    for (let i = 0; i < 6; i++) {
      podActive[i] = bitByte & Math.pow(2,i+2);
    }
    updateTime = new Date();
    updateTime.setTime(data.readInt32LE(3)*1000);
    latitude = data.readInt32LE(7)/100000/60;
    longitude = data.readInt32LE(11)/100000/60;
    altitude = data.readUInt16LE(15);
    vertVel = data.readInt16LE(17)*0.1;
    groundSpeed = data.readUInt16LE(19)*0.1;
    heading = data.readUInt8(21);
    if (!headingSign) heading = -heading;
    battVolt = data.readUInt8(22)*0.05;
    intTemp = data.readInt16LE(23)*0.01;
    extTemp = data.readInt16LE(25)*0.01;
  }
  console.log("File contains " + sbdLength + " bytes");
  console.log("Mission ID: " + missionID);
  console.log("GPS fix: " + gpsFix);
  console.log("Update time: " + updateTime.toString());
  console.log("Lat, lng: " + latitude + ", " + longitude);
  console.log("Altitude: " + altitude);
  console.log("Vertical velocity: " + vertVel);
  console.log("Ground speed: " + groundSpeed);
  console.log("Heading: " + heading);
  console.log("Battery: " + battVolt);
  console.log("Internal temperature: " + intTemp);
  console.log("External temperature: " + extTemp);
  console.log("Active pods:");
  console.log(podActive);
})
