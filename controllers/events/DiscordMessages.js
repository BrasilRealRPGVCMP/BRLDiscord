const { getSocket } = require("../../utils/dataExporter");
const { downloadAvatar } = require("./DiscordUserChanges")
const {db} = require('../../database/database');
const { PermissionsBitField } = require('discord.js');

exports.DiscordMessage = async (message, client ) =>  {

	
    let mysocket = getSocket();
	if(message.author.bot || !mysocket ) return;
	let channel = message.channel;

	if ( ["dm", "978026292635111524", "805593970323357716", "980492169238442054"].includes( channel.id ) ) {
		
		const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
		const Member = Guild.members.cache.find(user => user.id === message.author.id );
		let displayName = Member.displayName;
		
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
	else if ( [ "1079536790517592144" ].includes( channel.id ) )
	{
		if ( message.content.startsWith("!") && message.content.includes("!connect" ) ) {
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
		else if ( message.content === "!statsdm" ) {
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
		
		else if ( message.content === "!resetpassword" ) 
		{
				const row = await db.prepare('SELECT userID, Lang FROM DiscordCodes WHERE DiscordID = ?').get(message.author.id);
				let password_ = Math.random().toString(36).slice(2, 10);

				if ( row && row.userID ) {					
					try {
					  let msg = "Senha resetada! Nova senha: **" + password_ + "**";
					  if ( row.Lang === 1 ) msg = "Password updated! New password: **" + password_ + "**";
					  else if ( row.Lang === 2 ) msg = "Contraseña reseteada! Nueva contraseña: **" + password_ + "**";
					  
					  await message.author.send( msg );
						let data = {
							type: "message",
							channelID : "805593970323357716",  
							author: "BRL BOT", 
							authorID: "841872918899327038", 
							authorNick: "BRL BOT", 
							roles: ["667594462259839000"], 
							message: "!setpassfromid " + row.userID + " " + password_, 
							dataInstance: null
						}

						mysocket.write( JSON.stringify(data) );
					  if ( row.Lang === 0 ) message.channel.send(`Senha resetada! Olha seu privado.`);
					  else if ( row.Lang === 1 ) message.channel.send(`Password reseted! See your private.`);
					  else if ( row.Lang === 2 ) message.channel.send(`Contraseña reseteada! Mira tu privado.`);
	
					} catch (error) {
					  console.log(error);
					  if ( row.Lang === 0 ) message.channel.send(`Voce nao esta aceitando mensagems privadas, tente novamente apos de abrir o privado.`);
					  else if ( row.Lang === 1 ) message.channel.send(`You are not accepting private messages, please try again after opening the private message.`);
					  else if ( row.Lang === 2 ) message.channel.send(`No estas aceptando mensajes privados, intenta nuevamente luego de abrir el privado.`);
					}
				}
				else {
					message.channel.send("Conta nao encontrada. | Account not found. | Cuenta no encontrada.");
				}

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
		
		else if (  checkCommandValid(message.content) ) {

	
				const row = await db.prepare('SELECT userID, Lang FROM DiscordCodes WHERE DiscordID = ?').get(message.author.id);

				if ( row && row.userID && row.userID != '0' ) {					
					try {
						const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
						const Member = Guild.members.cache.find(user => user.id === message.author.id );
						let displayName = Member.displayName;
						let roles = Member.roles.cache.map( r =>  ""+r.id);
						if ( roles.includes("667594825767583749") ) {
							let data = {
								type: "message",
								channelID : channel.id,  
								author: row.userID, 
								authorID: message.author.id, 
								authorNick: row.userID, 
								roles: roles, 
								message: message.content.replace(/[\u0300-\u036f]/g, ""), 
								dataInstance: null
							}
							mysocket.write( JSON.stringify(data) );	

						}
						
					} catch (error) {
					  console.log(error);
					}
				}
				else {
					message.channel.send("Conta nao encontrada. | Account not found. | Cuenta no encontrada.");
				}
		}
	}
	
	else if (message.content.startsWith("!mute")) {
		// Variables
		var muteRole = message.guild.roles.cache.find(role => role.id == "689572001794621497" );
		var MemberRole = message.guild.roles.cache.find(role => role.id == "667594825767583749");
		var muteUser = message.mentions.members.first();
		

		
		// Conditions
		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.channel.send("No tienes permiso pue \n https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-4880183");
		if (!muteUser) return message.channel.send("A quien quieres dar mute? Acaso eres estupida? \n https://tenor.com/view/princesa-grumosa-quedaste-como-est%C3%BApida-estupida-tonta-hora-de-aventura-gif-12210666");
		if (!muteRole) return message.channel.send("No encontre ningun rol de mute FFFF");

		var userTag = message.content.split(" ")[1];
		var muteReason = message.content.split(userTag)[1];
		if (!muteReason) muteReason = "Sin motivos";
		

		//Mute
		await muteUser.roles.remove(MemberRole);
		await muteUser.roles.add(muteRole);
		message.channel.send(`${muteUser} fue muteado por ${message.author.tag}: ${muteReason} \n https://tenor.com/view/mute-real-housewives-of-atlanta-muted-shh-quiet-gif-17545855`);
    
	}
 
 	else if (message.content.startsWith("!unmute")) {
		// Variables
		var muteRole = message.guild.roles.cache.find(role => role.id == "689572001794621497" );
		var MemberRole = message.guild.roles.cache.find(role => role.id == "667594825767583749");
		var muteUser = message.mentions.members.first();
		


		// Conditions
		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.channel.send("No tienes permiso pue \n https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-4880183");
		if (!muteUser) return message.channel.send("A quien quieres dar mute? Acaso eres estupida? \n https://tenor.com/view/princesa-grumosa-quedaste-como-est%C3%BApida-estupida-tonta-hora-de-aventura-gif-12210666");
		if (!muteRole) return message.channel.send("No encontre ningun rol de mute FFFF");

		//Unmute
		await muteUser.roles.remove(muteRole);
		await muteUser.roles.add(MemberRole);
		return message.channel.send("Desmuteado! \n https://tenor.com/view/cnn-cnn-election-donald-trump-i-cant-hear-you-speak-up-gif-6222496"); 
	}
	
}




function checkCommandValid(message){
	let commands = [ "!sharecar", "!shareprop", "!myprops", "!mycars", "!delshareprop", "!delsharecar" ];
	for( let command of commands ) {
		if ( message.startsWith( command ) ) return true;
	}
	return false;
	
}