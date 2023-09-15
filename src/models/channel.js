 const { model, Schema } = require('mongoose');

 const schema = new Schema({
    channelId: String,
    userId: String
 })

 module.exports = model('channel', schema);