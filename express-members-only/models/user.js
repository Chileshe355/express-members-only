const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const User = mongoose.model(
//   "User",
//   new Schema({
//     username: { type: String, required: true },
//     password: { type: String, required: true },
//   })
// );

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  privileges: {type:String, required:true},
  isAdmin:{type:String},
});

// Virtual for User's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/messageboard/${this._id}`;
});

// Export model.
module.exports = mongoose.model("User", UserSchema);
