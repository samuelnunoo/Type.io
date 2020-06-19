const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Schema
const nodeSpec = new Schema({
  name: { type: String, unique: true },
  content: Schema.Types.Mixed,
  functionValue: Schema.Types.Mixed,
  template: Schema.Types.Mixed,
  attrs: Schema.Types.Mixed
})

// Export
module.exports = mongoose.model('nodeSpec', nodeSpec)
