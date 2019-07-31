const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Guest', schema)