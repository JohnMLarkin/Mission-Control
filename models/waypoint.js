const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const WayPoint = new Schema({
  momsn: Number,  // mobile orginated message sqeuence number (Iridium)
  missionObjectId:  Schema.Types.ObjectId,
  inFlight: Boolean,
  isGPSfixValid: Boolean,
  isPodActive: [Boolean],
  gpsTime: Date,
  lat: Number,
  lng: Number,
  alt: Number,  // in meters
  vertVel: Number, // in m/s
  gndSpeed: Number, // in km/h
  heading: Number, // relative to north
  cmdBatteryVoltage: Number,
  intTemp: Number, // internal temperature in deg C
  extTemp: Number, // external temperature in deg C
  podData: [Object]
});

module.exports = mongoose.model('WayPoint', WayPoint);
