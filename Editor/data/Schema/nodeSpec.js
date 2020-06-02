let mongoose = require('mongoose');
let Schema = mongoose.Schema

//Schema
let nodeSpec =  new Schema({
  name:String,
  content: Schema.Types.Mixed,
  functionValue: Schema.Types.Mixed
})

//Export
module.exports = mongoose.model("nodeSpec", nodeSpec);
