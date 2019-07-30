const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: {
    type: String,
    default: false
  },
  password: {
    type: String,
    default: false
  }
})

module.exports = mongoose.model('Guest', schema)
