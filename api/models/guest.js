const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  }
})

module.exports = mongoose.model('Guest', schema)