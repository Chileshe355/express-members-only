const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const User = mongoose.model(
//   "User",
//   new Schema({
//     username: { type: String, required: true },
//     password: { type: String, required: true },
//   })
// );

const MessageSchema = new Schema({
 sender:{type:String, required:true},
 sender_id:{type:String, required:true},
 message:{type:String, required:true},
 time:{type:Date}
});

// Virtual for messages's URL
MessageSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/messageboard/message/${this._id}`;
});
// Virtual to modify data object
MessageSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); // format 'YYYY-MM-DD'
});

// Export model.
module.exports = mongoose.model("Message", MessageSchema);