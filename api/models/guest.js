const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    username : String,
    password : String
})
    
    module.exports = mongoose.model('Guest', schema);
