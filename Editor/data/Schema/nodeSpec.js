const mongoose = require('mongoose')
const Schema = mongoose.Schema

const nodeSpec = new Schema({
  name: { type: String, unique: true },
  content: Schema.Types.Mixed,
  functionValue: Schema.Types.Mixed,
  template: Schema.Types.Mixed,
  attrs: Schema.Types.Mixed
})

module.exports = mongoose.model('nodeSpec', nodeSpec)
