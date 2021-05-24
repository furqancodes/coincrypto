const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
  privateKey: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
})
const Users = mongoose.model('users', UserSchema)
module.exports = Users
