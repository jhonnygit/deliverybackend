const {mongoConfig}=require("../config");
const MongoDB=require("./mongodb.service");

const getUserData=async(username)=>{
    try{
        let userObject=await MongoDB.db
        .collection(mongoConfig.collections.USERS)
        .findOne({username});
        if(userObject){
            return {
                status:true,
                message:"User found successfully",
                data: userObject
            };
        }else{
            return {
                status:false,
                message:"No User found",                
            };
        }
    } catch(error){
        return {
            status:false,
            message:"No User found",
            error: `user finding failed: ${error?.message}`,
        };
    }
};

module.exports={getUserData};
