const mongoose = require('mongoose')
const BlockSchema = new mongoose.Schema({}, {strict: false})
const Blocks = mongoose.model('blocks', BlockSchema)
module.exports = Blocks
