const MongoDB=require("./mongodb.service");
const {mongoConfig, tokenSecret}=require("../config");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

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
    try{
        if(!user?.username || !user?.password)
            return {status:false, message:"Please fill up all the fields"};
        let userObject=await MongoDB.db
        .collection(mongoConfig.collections.USERS)
        .filldOne({username:user?.username});
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

module.exports={userRegister, userLogin,checkUserExist}