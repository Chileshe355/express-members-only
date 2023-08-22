const User = require("../models/user");
const Message = require("../models/message");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

//home page
exports.index = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "express",
    user: req.user,
  });
});

//sign up
//get

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
});

//login
//get
exports.log_in_get = asyncHandler(async (req, res, next) => {
  res.render("login-form");
});

//get detail for one user

exports.user_detail=asyncHandler(async(req,res,next)=>{
  const user= await User.findById(req.params.id).exec();
  console.log(user)
  const messageCount= await Message.count().exec();
  console.log(user.id)
  if(user===null){
    res.redirect("/")
  }

  res.render("user",{
    user:user,
    message_count:messageCount,
  })
})


//post
exports.sign_up_post = asyncHandler(async (req, res, next) => {
  // try {
  //     const user = new User({
  //       username: req.body.username,
  //       password: req.body.password
  //     });
  //     const result = await user.save();
  //     res.redirect("/");
  //   } catch(err) {
  //     return next(err);
  //   };
  bcrypt.hash(await req.body.password, 10, async (err, hashedPassword) => {
    // if err, do something
    if (err) {
      return next(err);
    }
    // otherwise, store hashedPassword in DB
    else {
      try {
        const user = new User({
          username: await req.body.username,
          password: hashedPassword,
        });

        const result = await user.save();
        res.redirect("/");
      } catch (err) {
        return next(err);
      }
    }
  });
});

//password verification


//post not working
// exports.log_in_post=asyncHandler(async(req,res,next)=>{
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/"
//   });
// })
//

//chat get. Get a list of all messages sent to the chat
exports.chat_get=asyncHandler(async(req,res,next)=>{
  console.log(req.params.id)
  const user= await User.findById(req.params.id)
  const chat = await  Message.find().exec();

  res.render("chat",{
    title:"All Messages",
    user:user,
    chat:chat,
  })
})

// send message post will move later
exports.send_message_post = [
  
  
  body("message")
  .trim()
  .isLength({ min: 3 })
  .escape(),

//process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // //get all messages in the message db
    // const chat = await Message.find().exec()
    //Extract validation errors from request
    const errors= validationResult(req);
    //get logged in user from db with id in req
    
    const user= await User.findById(req.params.id).exec()
    // const date = new Date()
    //create new message object with escaped and trimmed data
    const message = new Message({
      sender: user.username,
      sender_id:user._id,
      message: req.body.message,
      date: new Date() // time is not working will figure out why later
    })

    if(!errors){
      //if there are errors re-render form with escaped and trimmed data and error messages
      res.render("/",{
        message:message,
        errors:errors.array(),
      });
      return
    }
    else{
      //data form is valid
       //save data to db
       await message.save();
       //redirect to chat page
       res.redirect("chat");
    }
  }),
];
//also need to move send message into chat 
//delete message post (no get will be displayed on the same page as chat)
exports.delete_message_post=asyncHandler(async(req,res,next)=>{
  //find message in db

  const message= await Message.findById(req.params.id).exec();
 //const sender = await User.findById(message.sender_id)
  // if (message === null) {
  //   // No results.
  //   res.redirect("/");
  // }
  await Message.findByIdAndRemove(req.params.id);
  res.redirect(`/messageboard/${message.sender_id}/chat`)

})

//user update for entering the club
exports.update_user_status_post=asyncHandler(async(req,res,next)=>{
  //get user
  const currentUser= await User.findById(req.params.id).exec();
  //check user status
  if(currentUser.privileges=="member"){
    //if use is not a member then continue to update otherwise don't
    res.redirect(`/messageboard/${currentUser.id}`)
  }

    //create new user object
    const user = new User({
      username: currentUser.username,
      password: currentUser.password,
      privileges: "member",
      isAdmin:currentUser.isAdmin,
      _id: req.params.id, // other wise a new id may be created
    })

    //update record
    await User.findByIdAndUpdate(req.params.id, user)
    res.redirect(`/messageboard/${currentUser.id}`,{
      user:user
    })
  
})
