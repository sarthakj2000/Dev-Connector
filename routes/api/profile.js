const express=require("express");
const router= express.Router();
const auth=require("../../middleware/auth");
const {check,validationResult}=require("express-validator");
const Profile=require("../../models/Profile");
const User=require("../../models/User");

//get @user api/profile/me
//@description get users current profile
//@access private

router.get("/me",auth,async(req,res)=>{
  try{
    const profile=await Profile.findOne({user:req.user.id}).populate("user",["name","avatar"]);
    if(!profile){
      return res.status(400).json({msg:"there is no profile for this user"});
    }
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//post @user api/profile
//@description create or update profile
//@access private
router.post("/",[auth,
check("status","status is required").not().isEmpty(),
check("skills","skill is required").not().isEmpty()
],async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({error:errors.array()});
  }

  const{
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  }=req.body;

  //build profile Object
  const profileFields={};
  profileFields.user=req.user.id;
  if(company) profileFields.company=company;
  if(website) profileFields.website=website;
  if(location) profileFields.location=location;
  if(bio) profileFields.bio=bio;
  if(status) profileFields.status=status;
  if(githubusername) profileFields.githubusername=githubusername;
  if(skills){
    profileFields.skills=skills.split(",").map(skill=>skill.trim());
  }
  //build socila object
  profileFields.social={}
  if(youtube) profileFields.social.youtube=youtube;
  if(twitter) profileFields.social.twitter=twitter;
  if(facebook) profileFields.social.facebook=facebook;
  if(linkedin) profileFields.social.linkedin=linkedin;
  if(instagram) profileFields.social.instagram=instagram;

try{
  let profile=await Profile.findOne({user:req.user.id});
  if(profile){
    //update
    profile=await Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true});
    return res.json(profile);
  }
  //Create
  profile=new Profile(profileFields);
  await profile.save();
  res.json(profile);
}catch(err){
console.error(err.message);
res.status(500).send("server error");

}
});
//@route get api/profile
//@description get all profiles
//@access public
router.get("/",async(req,res)=>{
  try{
    const profiles=await Profile.find().populate("user",["name","avatar"]);
    res.json(profiles);
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route get api/profile/user/user_id
//@description get all profiles
//@access public
router.get("/user/:user_id",async(req,res)=>{
  try{
    const profile=await Profile.findOne({user: req.params.user_id}).populate("user",["name","avatar"]);
    if(!profile)
    return res.status(400).json({msg:"profile not found"});
    res.json(profile);
  }catch(err){
    console.error(err.message);
    if(err.kind=="ObjectId"){
      return res.status(400).json({msg:"profile not found"});
    }
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route Delete api/profile
//@description Delete profile,user &posts
//@access private
router.delete("/",auth,async(req,res)=>{
  try{
    //todo remove user posts
    //remove user profile
    await Profile.findOneAndRemove({user:req.user.id});
    //remove user
    await User.findOneAndRemove({_id:req.user.id});

    res.json({msg:"user deleted"});
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route Put api/experience
//@description Add profile experience
//@access private
router.put("/experience",[auth,[
  check("title","title is required").not().isEmpty(),
  check("company","company is required").not().isEmpty(),
  check("from","from date is required").not().isEmpty()

]],async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const{
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }=req.body;

  const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
  try{
    const profile=await Profile.findOne({user:req.user.id});

    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route Delete api/profile/experience/:exp_id
//@description Delete experience from profile
//@access private
router.delete("/experience/:exp_id",auth,async(req,res)=>{
  try {
    const profile=await Profile.findOne({user:req.user.id});
    //get remove index
    const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports=router;






















//end
