const express=require("express");
const connectDB=require("./config/db");
const app=express();
//connect mongodb
connectDB();
app.use(express.json({extended:false}));
app.get("/",function(req,res){
  res.send("api running");
});
app.use("/api/users",require("./routes/api/users"));
app.use("/api/profile",require("./routes/api/profile"));
app.use("/api/post",require("./routes/api/post"));
app.use("/api/auth",require("./routes/api/auth"));









const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`server started on port ${PORT}`));
