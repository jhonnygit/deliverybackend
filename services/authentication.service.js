const MongoDB=require("./mongodb.service");
const {mongoConfig, tokenSecret}=require("../config");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const config = require("../config");

const userRegister=async(user)=>{
    try{        
        if(!user?.username || !user?.email || !user?.password)
            return {status:false, message:"Please fill up all the fields"};
        const passwordHash=await bcrypt.hash(user?.password,10)
        let userObject={
            username:user?.username,
            email:user?.email,
            password:passwordHash,
        };
        let saveUser=await MongoDB.db
        .collection(mongoConfig.collections.USERS)
        .insertOne(userObject);
        if(saveUser?.acknowledged && saveUser?.insertedId){
            let token=jwt.sign(
                {username:userObject?.username,email:userObject?.email},
                tokenSecret,
                {expiresIn:"24h"});
            return {
                status:true,
                message:"User registerd successfully",
                data:token,
            };
        }else{
            return {
                status:false,
                message:"User registerd failed",
            }; 
        }
    }catch(error){
        console.log(error);
        let errorMessage="User registered failed";
        error?.code===11000 && error?.keyPattern?.username
            ?(errorMessage="Username already exists") : null;
        error?.code===11000 && error?.keyPattern?.email
            ?(errorMessage="Email already exists") : null;
        return {
            status:false,
            message:errorMessage,
            error:error?.toString(),
        };
    }

};

const userLogin=async (user)=>{
    console.log(user);
    try{
        if(!user?.username || !user?.password)
            return {status:false, message:"Please fill up all the fields"};
        let userObject=await MongoDB.db
        .collection(mongoConfig.collections.USERS)
        .findOne({username:user?.username});
        if(userObject){
            let isPasswordVerified=await bcrypt.compare(
                user?.password,
                userObject?.password
            );
            if(isPasswordVerified){
                let token=jwt.sign(
                    {username:userObject?.username, email:userObject?.email },
                    tokenSecret,
                    { expiresIn: "24h"}
                );            
                return {
                    status:true,
                    message:"User login successfully",
                    data:token,
                };
            }
        }else{
            return {
                status:false,
                message:"incorrect password",
            }; 
        }
    } catch(error){
        console.log(error);       
        return {
            status:false,
            message:"user login failed",
            error:error?.toString(),
        };
    }

};

const checkUserExist=async(query)=>{
    let messages={
        email:"user already existe",
        username:"this username is taken",
    };    
    try{
        let queryType=Object.keys(query)[0];
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne(query);
        return !userObject
        ?{status:true, message:`This ${queryType} is not taken`}
        :{status:false, message:messages[queryType]};        
    } catch(error){}
};

const tokenVerification=async(req,res,next)=>{
    console.log(
        `authentication.service | tokenVerification | ${req?.originalUrl}`
    );
    try{
        if(
            req?.originalUrl.endsWith("/login") ||
            req?.originalUrl.endsWith("/user-exist") ||
            req?.originalUrl.endsWith("/register") 
        )
        return next();
        let token=req?.headers["authorization"];
        if(token && token.startsWith("Bearer")){
            token=token.slice(7,token?.length);
            jwt.verify(token,config.tokenSecret,(error,decoded)=>{
                if(error){
                    res.status(401).json({
                        status:false,
                        message:error?.name ? error?.name:"Invalidd Token",
                        error:`Invalid token | ${error?.message}`,
                    });
                }else{
                    req["username"]=decoded?.username;
                    next()
                }
            });
        }else{
            res.status(401).json({
                status:false,
                message:"Token missing",
                error:"Token missing",
            });
        }
    }catch(error){
        res.status(401).json({
            status:false,
            message:error?.message ? error?.message:"Authentication failed",
            error:`Authentication failed | ${error?.message}`,
        });
    }
};

const tokenRefresh = async (req, res) => {
    console.log(`authentication.service | tokenRefresh | ${req?.originalUrl}`);
    try {
      let token = req?.headers["authorization"];
      if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token?.length);
        jwt.verify(
          token,
          config.tokenSecret,
          { ignoreExpiration: true },
          async (error, decoded) => {
            if (error) {
              res.status(401).json({
                status: false,
                message: error?.name ? error?.name : "Invalid Token",
                error: `Invalid token | ${error?.message}`,
              });
            } else {
              if (decoded?.username && decoded?.email) {
                let newToken = jwt.sign(
                  { username: decoded?.username, email: decoded?.email },
                  tokenSecret,
                  { expiresIn: "24h" }
                );
                res.json({
                  status: true,
                  message: "Token refresh successful",
                  data: newToken,
                });
              } else {
                res.status(401).json({
                  status: false,
                  message: error?.name ? error?.name : "Invalid Token",
                  error: `Invalid token | ${error?.message}`,
                });
              }
            }
          }
        );
      } else {
        res.status(401).json({
          status: false,
          message: error?.name ? error?.name : "Token missing",
          error: `Token missing | ${error?.message}`,
        });
      }
    } catch (error) {
      res.status(401).json({
        status: false,
        message: error?.name ? error?.name : "Token refresh failed",
        error: `Token refresh failed | ${error?.message}`,
      });
    }
  };
  

module.exports={userRegister, userLogin,checkUserExist,tokenVerification,tokenRefresh}