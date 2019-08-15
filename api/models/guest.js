const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
},
{timestamps: { 
  createdAt: 'created_at', 
  updatedAt: 'updated_at' 
}
})

module.exports = mongoose.model('Guest', schema)