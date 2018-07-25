const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const podDataTypes = [
  ['uint8',1],
  ['int8',1],
  ['uint16',2],
  ['int16',2],
  ['uint32',4],
  ['int32',4],
  ['float',4],
  ['double',8]
];

const PodSchema = new Schema({
  podDescription: String,
  dataDescriptions: [String],
  dataTypes: [Number]
})

const Mission = new Schema({
  missionID: Number,
  launchCode: String,
  description: String,
  organizationID: Schema.Types.ObjectId,
  podManifest: [PodSchema],
  status: {
    type: String,
    enum: ['planned','active','archived'],
    default: 'planned'
  },
  launchDate: Date,
  createdByID: Schema.Types.ObjectId
})

module.exports = {
  'PodSchema': mongoose.model('PodSchema',PodSchema),
  'Mission': mongoose.model('Mission',Mission),
  'podDataTypes': podDataTypes
}
