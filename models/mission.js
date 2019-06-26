const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const podDataTypes = {
  uint8: 1,
  int8: 1,
  uint16: 2,
  int16: 2,
  uint32: 4,
  int32: 4,
  float: 4,
  double: 8
};

const Mission = new Schema({
  missionID: Number,
  launchCode: String,
  description: String,
  organizationID: Schema.Types.ObjectId,
  podManifest: [Schema.Types.Mixed],
  status: {
    type: String,
    enum: ['planned','active','archived'],
    default: 'planned'
  },
  launchDate: Date,
  createdByID: Schema.Types.ObjectId
})

module.exports = {
  'Mission': mongoose.model('Mission',Mission),
  'podDataTypes': podDataTypes
}
