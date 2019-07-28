const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: String,
  password:String
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

module.exports = mongoose.model('Guest', schema)