const { MongoClient} = require("mongodb");
const { mongoConfig} = require("../config");

class MongoDB {
    static connectToMongoDB=()=>{
        MongoClient.connect(mongoConfig.connectionUrl)
        .then((connection)=>{
            console.log("MongoDB connected");
            this.db=connection.db(mongoConfig.database);
        }).catch((error)=>console.log(`mongoDB not connected: ${error}`));
    };
}

MongoDB.db=null;
module.exports=MongoDB;
