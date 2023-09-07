const net = require('net');
const { client, updateServerInformation, updateServerTOP} = require('./services/discordSystem');

const {db} = require('./database/database');
const { addMusic } = require('./routes');
const {  generateDMCard } = require('./services/DiscordCard');
const {  getMessages, findMessage, pushMessage } = require('./services/MessagesSaver');
const { addSocket } = require("./utils/dataExporter");
const { downloadAvatar } = require("./controllers/events/DiscordUserChanges")

const exec = require('child_process').exec;

var mysocket = null;
const server = net.createServer((socket) => {
	
  if ( socket.remoteAddress.includes("127.0.0.1") ) {
	  mysocket = socket;
	  addSocket(socket); 
  }
  
  
  socket.on('data', (data) => { 
	try{
		let dataString = data.toString();
		
		 
		if ( !dataString.includes("\nend") ) return 0;
		dataString.split("\nend").forEach( async message => {
			
				if (!message) return 0;
				message = message.replace( RegExp("\n",'g'), "\\n" );  
				let objData = JSON.parse(message); 
				if ( objData.type == "userlist" ) {
					sendUsersLIST();
				}
				else if ( objData.type === "radio" ) { 
					let {from, song} = objData;
					//addMusic(from, song, socket);
					
				}
				else if ( objData.type === "server_action" ) {
					const action = objData.action, discordId = objData.discordId;
					const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.

					if ( action && discordId ) {
						try {
							const Members = await Guild.members.fetch();
							let user = Members.find(user => user.id == discordId );
							if ( user ) {								
								const MemberRole = Guild.roles.cache.find(role => role.id == "667594825767583749");
								const MuteRole = Guild.roles.cache.find(role => role.id == "689572001794621497");
								const TempBannedRol = Guild.roles.cache.find(role => role.id == "713883811838033980");
								const BannedRol = Guild.roles.cache.find(role => role.id == "689620573290364980");
								switch(action)
								{
									case "mute":
										await user.roles.remove(MemberRole);
										await user.roles.add(MuteRole);
									break;
									
									case "unmute":
										await user.roles.add(MemberRole);
										await user.roles.remove(MuteRole);
									break;
									
									case "ban":
										await user.roles.remove(MemberRole);
										await user.roles.add(BannedRol);
									break;
									
									case "tempban":
										await user.roles.remove(MemberRole);
										await user.roles.add(TempBannedRol);
									break;
									
									case "unban":
										await user.roles.add(MemberRole);
										await user.roles.remove(TempBannedRol);
										await user.roles.remove(BannedRol);
									break;
									
								}	
							}
						}
						catch(e){
							console.log("ERROR CATCHING USER: " + e );
							console.error(e);
						}
					}

				}
				
				
				else if ( objData.type === "message" ) { 
					
					if ( objData.message.includes(":speech_balloon:") ) objData.message = DesglosarMessage(objData.message);
					
					let channel = client.channels.cache.get(objData["channel"]);
					let message = await channel.send(objData["message"].replace( RegExp("\\n",'g'), "\n" ) );
					if ( message.id && objData["channel"] === "978026292635111524" ) pushMessage(message.id, objData["message"]);
				}
				else if ( objData.type === "sendreply" ) { 
					objData.message = removeHexColor( objData.message ) ;
					objData.rmessage = removeHexColor( objData.rmessage ) ;
					
					if ( objData.message.includes(":speech_balloon:") ) objData.message = DesglosarMessage(objData.message);
					let messageId = findMessage(objData.rmessage);
				
					const channel = await client.channels.cache.get(objData["channel"]);
					if ( !messageId || !messageId.id )  {
						const message = await channel.send(objData["message"].replace( RegExp("\\n",'g'), "\n" ) );
						pushMessage(message.id, objData["message"]);							
					}
					else {
						const message = await channel.messages.fetch(messageId.id);
						if ( message ) {
							let replMessage = await message.reply(objData["message"].replace( RegExp("\\n",'g'), "\n" ) );
							if ( replMessage.id ) pushMessage(replMessage.id, objData["message"]);				
						}
		
					}

				}
				else if ( objData.type === "private" ) { 
					 
					try{ 
						const Guild = client.guilds.cache.get("667592360867397662"); 
						const receptor = Guild.members.cache.find(user => user.id === objData.channel );
						receptor.send(objData["message"].replace( RegExp("\\n",'g'), "\n" ) );
					}
					catch(e){
						console.error(e);
					}
				}
				else if ( objData.type === "punishment" ) { 
					client.channels.cache.get("978026292635111524").send(objData["message"]);
					client.channels.cache.get("805593970323357716").send(objData["message"]);

					let embed2 = {
					  "type": "rich",
					  "title": "",
					  "description": objData["message_punishment"],
					  "color": 0x691ded,
					}
						 

					client.channels.cache.get("998963903788748881").send({ embeds: [embed2] })
				}
				else if ( objData.type === "change_nick" ) {
					let admin = objData["admin"];
					let oldNick = objData["old"];
					let newNick = objData["new"];
					
						 

					client.channels.cache.get("732370077625876571").send("**:repeat: Transfered by "+ admin + "**\n\n:arrow_left: **__Old nick:__** " + oldNick  + "\n\n:arrow_right: **__New nick:__** " + newNick)
				}
				else if ( objData.type === "showtop" ) { 
					let {channel, title, message } = objData;
					updateServerTOP(channel, title, message.replace( RegExp(",",'g'), "\n" ) )
					
				}
				else if ( objData.type === "join" ) {  
						let fecha = new Date();
						let name = objData.author;
						let Embed = {
						  "type": "rich",
						  "title": "",
						  "description": "",
						  "color": 0x67f121,
						  "fields": [
							{
							  "name": `**${name}** entrou no server. **(${objData.country})**`,
							  "value": "\u200B",
							},
						  ],
						  "timestamp": fecha.toISOString(),
						  "thumbnail": {
							"url": `https://c.tenor.com/u88iXzNT0_IAAAAC/gojou-gojo.gif`,
							"height": 0,
							"width": 0
						  }
						}
						client.channels.cache.get("978026292635111524").send( { embeds: [Embed] } );
						updateServerInformation(objData.playerCount, "ONLINE");
						Embed = null;
						user = null;
					
						let embed2 = {
						  "type": "rich",
						  "title": "",
						  "description": "**" + objData.author + "** entrou - **" + objData.FullTime + "** @ **" + objData.ip + "**",
						  "color": 0x67f121,
						}
						client.channels.cache.get("805593970323357716").send({ embeds: [embed2] });
					

				}
				else if ( objData.type === "part" ) { 
						let username = objData.author;
						let DataMotivo = objData.motivo;
						let fecha = new Date();
						let myEmbed = {
							"type": "rich",
							"title": "",
							"description": "",
							"color": 0xf12121,
							"fields": [
								{
								 "name": `**${username}** saiu. **(${objData.part})**`,
								 "value": "\u200B"
								},
							],
							"timestamp": fecha.toISOString(),
							"thumbnail": {
								"url": `https://i.imgur.com/ygdN2PA.gif`,
							}
						}
						client.channels.cache.get("978026292635111524").send( { embeds: [myEmbed] } );
						updateServerInformation(objData.playerCount, "ONLINE");
						

						let embed2 = {
						  "type": "rich",
						  "title": "",
						  "description": "**" + objData.author + "** saiu(" + objData.part + ") - **" + objData.FullTime + "**",
						  "color": 0xf12121,
						}
					client.channels.cache.get("805593970323357716").send({ embeds: [embed2] });
					 
				}
				else if ( objData.type === "killmsg" ) { 
						let user = objData.user;
						let killer = objData.killer;
						let bodypart = objData.bodypart;
						let mts = objData.mts;
						let wepName = objData.weaponName;
						let wepID = objData.weapon;
						
						let fecha = new Date();
						let myEmbed = {
							"type": "rich",
							"title": `${killer} killed ${user}`,
							"description": `Parte do corpo: **${bodypart}**, Arma: **${wepName}**, Dist�ncia: **${mts}**`,
							"color": 0x0c6a6a,
							"thumbnail": {
								"url": getWeaponIMG( parseInt(wepID) ),
							}
						}
						client.channels.cache.get("978026292635111524").send( { embeds: [myEmbed] } );
				}
				else if ( objData.type === "embed" ) {  
		
						let embed2 = {
						  "type": "rich",
						  "title": objData.title,
						  "description": objData.message.replace( RegExp("\\n",'g'), "\n" ),
						  "color": 0x06cb02,
						} 
					client.channels.cache.get(objData["channel"]).send({ embeds: [embed2] });
				}
				else if ( objData.type === "playercount" ) {
					
					client.channels.cache.get("978026292635111524").setTopic(objData.message);
					client.channels.cache.get("805593970323357716").setTopic(objData.message);
				}
				else if ( objData.type === "pm" ) {
					let data = {
						type		: 	'pm',
						author 		: 	objData.author,
						receptor    :   null,
						status		: 	false
					} 
					 
					try{
						const Guild = client.guilds.cache.get("667592360867397662"); 
						const receptor = Guild.members.cache.find(user => user.displayName.includes(objData.channel) );
						
						if ( receptor ) {
							receptor.send( "**"+ objData.author + "**: " + objData.message);
							data.status = true; 
							data.receptor = receptor.displayName;
						}		
					} catch(e){
						console.log("Error in PM: " + e.message);
					}
					
					mysocket.write( JSON.stringify(data) );
				}
				else if ( objData.type === "canvas_stats_dm" ) 
				{
					let idioma = parseInt(objData.idioma)
					const Tarjeta = await generateDMCard( objData?.nome, objData?.matou, objData?.morreu, objData?.spree, objData?.weapons, objData?.rowid, objData?.fecha, objData?.authorID);
					
					let content;
					if ( idioma == 0 )content  = `${objData?.nome}, aqui estao suas estatisticas de DM. Voce se encontra em Top #${objData?.rowid} Killers, tendo ${objData?.matou} kills e ${objData?.morreu} deaths.`
					else if ( idioma == 2 ) content = `${objData?.nome}, aqui tus estadisticas de DM. Te encuentras en el Top #${objData?.rowid} Killers, cuentas con ${objData?.matou} kills y ${objData?.morreu} deaths.`
					else content = `${objData?.nome}, here your DM stats. you are in the Top #${objData?.rowid} Killers, you have ${objData?.matou} kills and ${objData?.morreu} deaths.`
					
					client.channels.cache.get("1079536790517592144").send({
						files: [{
							attachment: Tarjeta,
							name: 'DMStats.png'
						}],
						content
					})
				}
				else if ( objData.type === "confirm_dc" ) 
				{
					let userID = parseInt(objData.userID);
					let discordId = parseInt(objData.discordId);
					let Lang = parseInt(objData.Lang);
					let dcid = makeid(7);
					
					let stmt = db.prepare("INSERT INTO DiscordCodes VALUES( ?, ?, ?, ? )")

					await stmt.run( userID, dcid, discordId, Lang );
					console.log({userID, dcid, discordId, Lang});
					stmt = null;
					try {
						const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
						const Members = await Guild.members.fetch();
						let user = await Members.find(user => user.id == discordId );
				
						const VerifiedRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("server verified"));
						await user.roles.add(VerifiedRole);
						
						let avatar = user.displayAvatarURL({ size: 128, dynamic: true });
						await downloadAvatar(avatar, discordId);
					}
					catch(e){
						console.log("ERROR CATCHING USER AVATAR!");
					}
				}
				else if ( objData.type === "verify_dc" ) 
				{
					let userNick = objData.userNick;
					let userID = parseInt(objData.userID);
					let Key = objData.Key;
					let Lang = parseInt(objData.Lang);
					let sended = false;
					const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
					const row = await db.prepare('SELECT * FROM validations WHERE key = ?').get(Key);
					if ( row ){
						let discordId = row.user;
						const row2 = await db.prepare('SELECT * FROM DiscordCodes WHERE userID = ? AND DiscordID = ?').get( [userID, discordId] );
						if ( row2 == null ) {
							let stmt = db.prepare("INSERT INTO DiscordCodes VALUES( ?, ?, ?, ? )")
							await stmt.run( userID, userID + parseInt((new Date().getTime() / 60000)) + Key, row.user, Lang );
							stmt = null;
							mysocket.write( JSON.stringify({ type:"confdc", userID: userID, Lang: Lang, discordId: row.user }) );

						} 

						stmt = db.prepare("DELETE FROM validations WHERE key = ?")
						stmt.run( Key )
						stmt = null;

						const fetchedChannel = client.channels.cache.get( row.channel  );
						fetchedChannel.delete();
						
						try { 
						client.channels.cache.get("731946202748420117").send( `:white_check_mark: Discord Account Accepted: <@${discordId}> - **${userNick}**` );
						
						}
						catch(e){
							console.log("ERROR NOTIFIER VERIFIED: " + e );
							console.error(e);
						}

						try {
							const Members = await Guild.members.fetch();
							let user = Members.find(user => user.id == discordId );

							const MemberRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("brl - member"));
							const VerifiedRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("server verified"));
							const InvitedRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("invited"));
							await user.roles.add(MemberRole);
							await user.roles.add(VerifiedRole);
							if ( InvitedRole ) user.roles.remove(InvitedRole);
							let avatar = user.displayAvatarURL({ size: 128, dynamic: true });
							downloadAvatar(avatar, discordId);
						}
						catch(e){
							console.log("ERROR CATCHING USER: " + e );
							console.error(e);
						}
						
						
						if ( !sended ) mysocket.write( JSON.stringify({ type:"MessageForPlayer", typeMSG: 'info', pt: "Conta verificada com successo!", en: "Account verified successfully!", es: "Cuenta verificada correctamente!", userNick }) );
					}
					else {
						mysocket.write( JSON.stringify({ type:"MessageForPlayer", typeMSG: 'error', en: "Code not found.", es: "Codigo no encontrado.", pt: "Codigo nao encontrado.", userNick }) );
					}
				}
			
		});
	} catch(e){
		console.log(data.toString());
		console.log("ERROR DISCORD >>>> " + e);
	}
	
  })

  socket.on('close', (data) => {
    console.log(data.toString() +" left");
  });
  
  socket.on("error", (err) =>{
    console.log("Caught flash policy server socket error: ")
    console.log(err.stack)
  }); 

});

server.on('connection',function(socket){

  console.log('Buffer size : ' + socket.bufferSize);

  var rport = socket.remotePort;
  var raddr = socket.remoteAddress;
  var rfamily = socket.remoteFamily;

  console.log('REMOTE Socket is listening at: ' + raddr + " port:" + rport);

  if ( !raddr.includes("127.0.0.1") ) {
	console.log("KICKEADOOOO");
	return socket.destroy();  
  }
  
  sendUsersLIST();
	client.channels.cache.get("978026292635111524").setTopic("Discord iniciado! - " + new Date().toString() );
	client.channels.cache.get("805593970323357716").setTopic("Discord iniciado! - " + new Date().toString() );

server.getConnections(function(error,count){
  console.log('Number of concurrent connections to the server : ' + count);
});
 
})

server.listen(9898, '127.0.0.1', () => {
  console.log('opened server on', server.address().port);
});


function sendUsersLIST(){
	const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
	const Members = Guild.members.cache.map(user =>  { return {Username: user.displayName, ID: user.id} } );
	console.log("ENVIANDO LOS USUARIOS!")
	mysocket.write( JSON.stringify({ type:"userlist", users: Members}) );
}

function DesglosarMessage(message){
	let oldmsg = message;
	let xsplit = message.split("message\":");
	let destruct = xsplit[1];
	if ( destruct ) {
		let destruct2 = destruct.slice(1,-4).replace(RegExp("\"", 'g'), '\'').replace(RegExp("}", 'g'), '').replace(RegExp("{", 'g'), '').replace(/\r?\n|\r/g, "");
		return xsplit[0]+`message": "${destruct2}" }`;
	}
	else return message;
}

setInterval( () => {
	sendUsersLIST();
}, ( 54000 * 1000 )); //15 horas

function getWeaponIMG(id){
	if ( id == 0 ) return "https://i.imgur.com/rE9yL0E.png"
	else if ( id == 1 ) return "https://i.imgur.com/BvnisVJ.png";
	else if ( id == 2 ) return "https://i.imgur.com/vLh3xjw.png";
	else if ( id == 3 ) return "https://i.imgur.com/SyCfFEN.png";
	else if ( id == 4 ) return "https://i.imgur.com/s00xARG.png";
	else if ( id == 5 ) return "https://i.imgur.com/50PgSHq.png";
	else if ( id == 6 ) return "https://i.imgur.com/7J3qgro.png";
	else if ( id == 7 ) return "https://i.imgur.com/BdPfaSx.png";
	else if ( id == 8 ) return "https://i.imgur.com/h5nN72J.png";
	else if ( id == 9 ) return "https://i.imgur.com/J4MYCUP.png";
	else if ( id == 10 ) return "https://i.imgur.com/kWj0Dis.png";
	else if ( id == 11 ) return "https://i.imgur.com/RG4h914.png";
	else if ( id == 12 ) return "https://i.imgur.com/19iuC2V.png";
	else if ( id == 13 ) return "https://i.imgur.com/e9KNLwq.png";
	else if ( id == 14 ) return "https://i.imgur.com/DzZc0Fk.png";
	else if ( id == 15 ) return "https://i.imgur.com/qLCoZQZ.png";
	else if ( id == 16 ) return "https://i.imgur.com/IRUBU3l.png";
	else if ( id == 17 ) return "https://i.imgur.com/1etmDxW.png";
	else if ( id == 18 ) return "https://i.imgur.com/nNuFHwT.png";
	else if ( id == 19 ) return "https://i.imgur.com/cqzncxt.png";
	else if ( id == 20 ) return "https://i.imgur.com/zPuMRRb.png";
	else if ( id == 21 ) return "https://i.imgur.com/0kw4rlw.png";
	else if ( id == 22 ) return "https://i.imgur.com/ScBCGWV.png";
	else if ( id == 23 ) return "https://i.imgur.com/fa4SS7E.png";
	else if ( id == 24 ) return "https://i.imgur.com/VY3yrK5.png";
	else if ( id == 25 ) return "https://i.imgur.com/aFmZoN7.png";
	else if ( id == 26 ) return "https://i.imgur.com/3TzbJea.png";
	else if ( id == 27 ) return "https://i.imgur.com/MZcvp4n.png";
	else if ( id == 28 ) return "https://i.imgur.com/aurwrEl.png";
	else if ( id == 29 ) return "https://i.imgur.com/Szc7NwQ.png";
	else if ( id == 30 ) return "https://i.imgur.com/IRUBU3l.png";
	else if ( id == 31 ) return "https://i.imgur.com/BjCcDUn.png";
	else if ( id == 32 ) return "https://i.imgur.com/eslnRGT.png";
	else if ( id == 33 ) return "https://i.imgur.com/tcjcP5u.png";
	else return "https://assets.dragoart.com/images/22790_501/how-to-draw-the-death-note-notebook_5e4ce5c53ecc18.98728164_116208_5_3.png"
	
}




function removeHexColor(text){
		return text.replace( /\[(#[0-9a-f]{6})\]/gi, "")
}
 
 
 function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


function generateBackup(){
    let date = new Date()

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hour = date.getHours();
	
	const name =  `DataBase_${hour}_${day}_${month}_${year}`;
	exec("cp /root/brl/DataBase.db /root/brl/backup/"+ name +".db");

	if ( client.channels.cache.get("942138478232207620") ) {
		
		let embed2 = {
			"type": "rich",
			"title": "",
			"description": "BACKUP GENERADO > " + name,
			"color": 0x00AE86,
		}
		client.channels.cache.get("942138478232207620").send({ embeds: [embed2] });
	}
}
 
 // 8 horas
setInterval( () => { generateBackup(); }, 28800000)