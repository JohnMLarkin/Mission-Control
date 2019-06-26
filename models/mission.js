const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

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
  'Mission': mongoose.model('Mission',Mission)
}
