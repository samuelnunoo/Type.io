let mongoose = require('mongoose');
let Schema = mongoose.Schema

//Schema
let Page =  new Schema({
  title:String,
  content: Schema.Types.Mixed,
  references: Schema.Types.Mixed,
})

//Export
module.exports = mongoose.model("Page", Page);
