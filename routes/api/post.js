const express=require("express");
const router= express.Router();

//get @user api/post
//@description test route
//@access public

router.get("/",(req,res)=>res.send("posts route"));
module.exports=router;
