const express=require("express");
const router= express.Router();
const {check,validationResult}=require("express-validator");
const auth=require("../../middleware/auth");
const Post=require("../../models/Post");
const User=require("../../models/User");
const Profile=require("../../models/Profile");


//@route post api/posts
//@description create post
//@access private

router.post("/",[auth,[
  check("text","text is required").not().isEmpty()
]],
async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  try{
    const user=await User.findById(req.user.id).select("-password");
    const newPost=new Post({
      text:req.body.text,
      name:user.name,
      avatar:user.avatar,
      user:req.user.id
    });
    const post=await newPost.save();
    res.json(post);
  }
  catch(err){
    console.error(err);
    res.status(500).sned("server error");
  }


});
//@route get api/posts
//@description get all post
//@access private
router.get("/",auth,async(req,res)=>{
try{
  const posts=await Post.find().sort({date:-1});
  res.json(posts);
}

catch(err){
  console.error(err);
  res.status(500).sned("server error");
}
});
//@route get api/posts/:id
//@description get post by id
//@access private
router.get("/:id",auth,async(req,res)=>{
try{
  const post=await Post.findById(req.params.id);
  if(!post){
    return res.status(404).json({msg:"no post found"});
  }
  res.json(post);
}
catch(err){
console.error(err.message);
if(err.kind==="ObjectId"){
  return res.status(404).json({msg:"no post found"});
}
res.status(500).send("server error");
}
});
//@route delete api/posts/:id
//@description delete a post
//@access private
router.delete("/:id",auth,async(req,res)=>{
try{
  const post=await Post.findById(req.params.id);
  if(!post){
    return res.status(404).json({msg:"no post found"});
  }
  //check user
  if(post.user.toString() !==req.user.id){
    return res.status(401).json({msg:"user not authorize"});
  }
  await post.remove();
  res.json({msg:"post removed"});
}

catch(err){
  console.error(err);
  if(err.kind==="ObjectId"){
    return res.status(404).json({msg:"no post found"});
  }
  res.status(500).sned("server error");
}
});
//@route put api/posts/likes/:id
//@description like a post
//@access private
router.put("/like/:id",auth,async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    //check if post is already been liked
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
      return res.status(400).json({msg:"post already liked"});
    }
    post.likes.unshift({user:req.user.id});
    await post.save();
    res.json(post.likes);
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route put api/posts/unlike/:id
//@description unlike a post
//@access private
router.put("/unlike/:id",auth,async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    //check if post is already been liked
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
      return res.status(400).json({msg:"post has not yet been liked"});
    }
    //get remove index
    const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex,1);
    await post.save();
    res.json(post.likes);
  }catch(err){
    console.error(err.message);
    res.status(500).send("server error");
  }
});







//@route post api/posts/comment/:id
//@description comment on a post
//@access private

router.post("/comment/:id",[auth,[
  check("text","text is required").not().isEmpty()
]],
async(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  try{
    const user=await User.findById(req.user.id).select("-password");
    const post=await Post.findById(req.params.id);
    const newComment={
      text:req.body.text,
      name:user.name,
      avatar:user.avatar,
      user:req.user.id
    };
    post.comments.unshift(newComment);
    await post.save();
    res.json(post.comments);
  }
  catch(err){
    console.error(err);
    res.status(500).sned("server error");
  }
});
//@route delete api/posts/comment/:post_id/comment_id
//@description delete a comment
//@access private
router.delete("/comment/:id/:comment_id",auth,async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    //pull out comment
    const comment=post.comments.find(comment=>comment.id===req.params.comment_id);
    //make sure comment exists
    if(!comment){
      return res.status(404).json({msg:"comment does not exist"});
    }
    //check users
    if(comment.user.toString() !==req.user.id){
      return res.status(401).json({msg:"user not authorized"});

    }
    //get remove index
    const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);
    post.comments.splice(removeIndex,1);
    await post.save();
    res.json(post.comments);
  }catch(err){
    console.error(err);
    res.status(500).send("server error");
  }
});
module.exports=router;



















//
