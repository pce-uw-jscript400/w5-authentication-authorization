const mongoose = require('mongoose')

const schema = mongoose.Schema({
  name: String,
  exclusive: {
    type: Boolean,
    default: false
  }
})
module.exports = mongoose.model('Party', schema)