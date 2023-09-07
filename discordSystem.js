var USERS_COUNT = 0; 
var mysocket = null;
const request = require('request');
const {db} = require('./database');
const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] });
const lib = require('lib')({token: "ODQxODcyOTE4ODk5MzI3MDM4.YJtFQQ.wjWDv9ICPtf7sNV59heHrhE9BP0"});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	updateServerInformation("0", "OFFLINE");
	sendConnectionToServeR();
})

 

client.on('messageCreate', async (message) => {
	if(message.author.bot || !mysocket ) return;
	let channel = message.channel;
	if ( ["dm", "978026292635111524", "805593970323357716", "980492169238442054"].includes( channel.id ) ) {
		
		const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
		const Member = Guild.members.cache.find(user => user.id === message.author.id );
		let displayName = Member.displayName;

		//if ( message.author.id === "776003478576300102" ) displayName = "Laiu";
		
		if ( message.content.startsWith("!") || message.content.startsWith(".") ) {
			let data = {
				type: "message",
				channelID : channel.id,  
				author: displayName, 
				authorID: message.author.id, 
				authorNick: displayName, 
				roles: Member.roles.cache.map( r =>  ""+r.id), 
				message: message.content.replace(/[\u0300-\u036f]/g, ""), 
				dataInstance: null
			}
			
			if ( channel.type == "dm" ) {
				data.channelID = '998235001768398908';
			}
			
			
			 mysocket.write( JSON.stringify(data) );
		}
	}
	else if ( [ "667592360867397666" ].includes( channel.id ) )
	{
		if ( message.content === "!statsdm" ) {
			const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
			const Member = Guild.members.cache.find(user => user.id === message.author.id );
			let displayName = Member.displayName;
		
			let data = {
				type: "message",
				channelID : channel.id,  
				author: displayName, 
				authorID: message.author.id, 
				authorNick: displayName, 
				roles: Member.roles.cache.map( r =>  ""+r.id), 
				message: message.content.replace(/[\u0300-\u036f]/g, ""), 
				dataInstance: null
			}
					
			 mysocket.write( JSON.stringify(data) );
		}	
		else if ( message.content.startsWith("!statstheme ") || message.content === "!statstheme" ) {
			let params = message.content.split(" ");
			if ( !params || params.length != 2 ) return message.channel.send(":face_with_monocle: - Use !statstheme <0/14> \n ( IDS: https://imgur.com/a/FsRQMDS )");
			else if ( parseInt(params[1]) == null ) return message.channel.send(":face_with_monocle: - Use !statstheme <0/14> \n ( IDS: https://imgur.com/a/FsRQMDS )");
			else {
				const row = await db.prepare('SELECT * FROM CardDecoration WHERE userID = ?').get(message.author.id);
				if ( !row ) {
					let stmt = await db.prepare("INSERT INTO CardDecoration VALUES( ?, ? )")
					stmt.run( message.author.id, parseInt(params[1]) )
					message.channel.send("¡Saved | Salvado | Guardado! :white_check_mark:");
					stmt = null;
				}
				else {
					let stmt = await db.prepare("UPDATE CardDecoration SET Background = ? WHERE userID = ? ")
					stmt.run( parseInt(params[1]), message.author.id )
					stmt = null;
					message.channel.send("¡Updated | Atualizado | Actualizado! :white_check_mark:");
				}
			}

		}
	}
});

//YOUR BOT TOKEN
client.login("ODQxODcyOTE4ODk5MzI3MDM4.YJtFQQ.wjWDv9ICPtf7sNV59heHrhE9BP0");
 
 
 
 const updateServerInformation = (playersActive, status) => {
	USERS_COUNT = playersActive;
	const row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
 			.setLabel('JOGAR | JUGAR | PLAY')
			.setStyle(ButtonStyle.Link)
			.setURL('https://discord.com/channels/1021515914245591130/1033448580951838811')
			.setDisabled(true),
	);
	
			
	let UsuariosEmbed = {
		  "type": "rich",
		  "title": `Brasil Real RPG`,
		  "description": "",
		  "color": 0xfda40a,
		  "fields": [
			{
			  "name": `🇪🇸 Utilice los botones de abajo para unirse al servidor.`,
			  "value": "\u200B"
			},
			{
			  "name": `🇧🇷 Use os Botões abaixo para entrar no servidor.\n`,
			  "value": "\u200B"
			},
			{
			  "name": `🇺🇸 Use the buttons below to enter the server.`,
			  "value": "\u200B"
			},
			{
			  "name": `🌐 Players Online`,
			  "value": `\`\`\`${USERS_COUNT}/100 \`\`\``,
			  "inline": true
			},
			{
			  "name": `🌐 Status Server:`,
			  "value": "```"+status+"```",
			  "inline": true
			}
		  ],
		  "thumbnail": {
			"url": `https://i.imgur.com/XtZ3sVX.gif`,
			"height": 0,
			"width": 0
		  }
		};
		
	const channel = client.channels.cache.get('1036445417224806512'); 
	channel.messages.fetch("1036451494561595483").then(msg => {
		if ( msg ) {
			msg.edit({ embeds: [UsuariosEmbed], components: [row] });
		}
	}); 
 }
 
 
 const updateServerTOP = (messageID, title, message) => {
	let UsuariosEmbed = {
		  "type": "rich",
		  "title": title,
		  "description": "**"+message+"**",
		  "color": 0xff9900,
		  "thumbnail": {
			"url": "https://pbs.twimg.com/media/FOdMK0bacAMWP5g.jpg",//
			"height": 0,
			"width": 0
		  }
		};
		
	const channel = client.channels.cache.get('1055446507987410994'); 
	channel.messages.fetch(messageID).then(msg => {
		if ( msg ) {
			msg.edit({ embeds: [UsuariosEmbed] });
		}
	}); 
 }
  
 function addSocket(soc){ 
	 mysocket = soc;
 }
 
 exports.client = client;
 exports.addSocket = addSocket;
 exports.updateServerInformation = updateServerInformation;
 exports.updateServerTOP = updateServerTOP;
 
 
 
 
function sendConnectionToServeR(){
 	request.post('http://63.142.251.10:3001/dxreconnectsocket', {test:"TT"}, function(error, response, body) {
		if (!error){
			console.log("Dexter received the start alert!");
		}
		
	});	
	
}