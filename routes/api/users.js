const express=require("express");
const router= express.Router();
const gravatar=require("gravatar");
const jwt=require("jsonwebtoken");
const config=require("config");
const bcrypt=require("bcryptjs");
const {check,validationResult}=require("express-validator");



const User=require("../../models/User");

//post @user api/users
//@description register user
//@access public

router.post("/",[
  check("name","name is required").not().isEmpty(),
  check("email","please include a valid email").isEmail(),
  check("password","please enter a password of at least 6 letters ").isLength({min:6})
],
async (req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json(({errors:errors.array()}));
  }
  const {name,email,password}=req.body;
  try {
    //see user exists
    let user=await User.findOne({email});
    if(user){
      return res.status(400).json({errors:[{msg:"user already exists"}]});
    }
    //get users garavatar
    const avatar=gravatar.url(email,{
      s:"200",
      r:"pg",
      d:"mm"
    });
    user=new User({
      name,
      email,
      avatar,
      password
    });
    //encrypt password
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(password,salt);
    await user.save();
    //return jsonwebtoken
      const payload={
        user:{
          id:user.id
        }
      };
      jwt.sign(payload,
        config.get("jwtSecret"),
      {expiresIn:36000},
       (err,token)=>{
         if(err) throw err;
         res.json({token});
       });
  } catch(err) {
      console.log(err.message);
      res.status(500).send("server error");
  }

});

module.exports=router;
