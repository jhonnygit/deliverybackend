const config=require("./package.json").projectConfig;

module.exports={
    mongoConfig:{
        connectionUrl:config.mongoConnectionUrl,
        database:"foodeliverydb",
        collections:{
            USERS:"users",
            RESTAURANTS:"restaurants",
            CARTS:"carts",
            FOODS: "foods",
            BOOKMARKS:"bookmarks"
        },
    },
    ServerConfig:{
        ip:config.serverIp,
        port:config.serverPort,
    },
    tokenSecret:"foodelivery_secret"
};