const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const Announcement = new Schema({
  title: String,
  body: String,
  expires: Boolean,
  expireDate: Date,
  createdByName: String
});

module.exports = mongoose.model('Announcement', Announcement);
