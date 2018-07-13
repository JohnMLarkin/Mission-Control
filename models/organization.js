const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const Organization = new Schema({
  name: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zipcode: String,
  contactName: String,
  contactEmail: String,
  url: String,
});

module.exports = mongoose.model('Organization', Organization);
