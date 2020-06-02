let mongoose = require("mongoose");

const server = "127.0.0.1:27017"
const database = "test"



class Database {
  constructor(){
    this._connect()
  }

  _connect(){
    mongoose.connect("mongodb://localhost/test",{ useNewUrlParser: true })
      .then( () => {
        console.log("Database connection successful")
      })
      .catch( err => {
        console.error("Database connection error",err)
      })
  }
}
module.exports = new Database()
