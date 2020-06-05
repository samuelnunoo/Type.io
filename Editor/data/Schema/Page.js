const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Schema
const Page = new Schema({
  title: String,
  content: Schema.Types.Mixed,
  references: Schema.Types.Mixed
})

// Export
module.exports = mongoose.model('Page', Page)
