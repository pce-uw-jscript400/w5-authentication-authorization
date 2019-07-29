const mongoose = require('mongoose')

const guestSchema = mongoose.Schema({
  username: {
    type:String,
  },
  password: {
    type: String
  }
})

module.exports = mongoose.model('Guest', guestSchema)
