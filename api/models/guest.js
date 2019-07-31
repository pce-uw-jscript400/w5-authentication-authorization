const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: String,
  password: String
}) // optionally add CreatedAd/UpdatedAt

module.exports = mongoose.model('Guest', schema)
