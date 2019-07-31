const mongoose = require('mongoose')

const schema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password : {
        type: String,
        requried: true
    }
})

module.exports = mongoose.model('Guest', schema)