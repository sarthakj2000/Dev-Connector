const express=require("express");
const router= express.Router();

//get @user api/auth
//@description test route
//@access public

router.get("/",(req,res)=>res.send("auth route"));
module.exports=router;
