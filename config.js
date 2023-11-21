const config=require("./package.json").projectConfig;

module.exports={
    mongoConfig:{
        connectionUrl:config.mongoConnectionUrl,
        database:"foodeliverydb",
        collections:{
            USERS:"users",
            RESTAURANTS:"restaurants",
        },
    },
    ServerConfig:{
        ip:config.serverIp,
        port:config.serverPort,
    },
    tokenSecret:"foodelivery_secret"
};