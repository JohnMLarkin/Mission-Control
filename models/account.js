const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
  username: String,
  password: String,
  email: String,
  role: {
    type: String,
    enum: ['standard','flightdirector','admin'],
    default: 'standard'
  }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
