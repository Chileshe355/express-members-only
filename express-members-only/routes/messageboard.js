var express = require('express');
var router = express.Router();

// Require controller modules.
const user_controller=require("../controllers/userController")

// GET catalog home page.
router.get("/", user_controller.index);
// sign up get page
router.get("/sign-up",user_controller.sign_up_get)
//login get page
// router.get("/log-in",user_controller.log_in_get)
// sign up post page
//router.post("/sign-up", user_controller.sign_up_post) moved to app .js 
// GET request for one user.
router.get("/:id", user_controller.user_detail);

// login post page
// router.post("/login",user_controller.log_in_post) moved to app .js 

//get chat (group of messages) get
router.get("/:id/chat",user_controller.chat_get)



//send message post
router.post("/:id/send-message",user_controller.send_message_post)

//post message delete
router.post("/message/:id/delete-message",user_controller.delete_message_post)

//update user membership status
router.post("/:id/update-user",user_controller.update_user_status_post)

//export router
module.exports = router;