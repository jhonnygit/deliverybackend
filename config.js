const config=require("./package.json").projectConfig;

module.exports={
    mongoConfig:{
        connectionUrl:config.mongoConnectionUrl,
        database:"foodeliverydb",
        collections:{
            USERS:"users",
        },
    },
    ServerConfig:{
        ip:config.serverIp,
        port:config.serverPort,
    },
};