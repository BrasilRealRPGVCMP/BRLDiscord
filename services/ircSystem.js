const irc = require('irc');
var config = {
    channels: [ "#BRL "+ BotStatus_Status("Password"), "#BRL_STAFF "+ BotStatus_Status("Password")/*, "#BRL.supervisor diego_pro21"*/ ],
    server: "irc.gtanet.com",//37.48.87.211
    botName: BotStatus_Status("BotName"),
	userName: BotStatus_Status("BotName"),
    oauth: "oauth:YOURUNIQUEOAUTHTOKEN",
    autoRejoin: true, 
    autoConnect: true,
    floodProtection: false,
    floodProtectionDelay: 3000
};

var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels,
    password: config.oauth
});

bot.addListener('join', function(channel, who) {
	try{
		console.log('%s joined %s', who, channel);
		if (channel == "#BRL_STAFF" && who == BotStatus_Status("BotName")  ){
			//bot.send("NS identify Mobster", "danitzaz");
			//setTimeout( () => {
			//	bot.say("Tug", "!dxreconnectsocket");
			//}, 1000);
		}
	}
	catch(e){
		console.log("ERROR IN JOIN IRC: " + e.message);
	}
});

function BotStatus_Status(tipo){
	switch(tipo){
		case "Password":
			return "TremendoBardo04$#22";
		break;
		
		case "BotName":
			return "BRL2023";
		break;
	}
}

exports.bot = bot;