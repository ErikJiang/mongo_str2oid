const mongoose = require('mongoose');
const db = require('./connect.js');
const ObjectId = mongoose.Schema.Types.ObjectId;
const logSchema = new mongoose.Schema({
    userId: ObjectId,
    addrId: ObjectId
});
let logModel = db.model('logs', logSchema);
module.exports = logModel;



