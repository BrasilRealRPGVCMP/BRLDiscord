var USERS_COUNT = 0; 
const request = require('request');
const {guildMemberAdd, guildMemberRemove} = require("../controllers/events/DiscordJoins")
const { DiscordMessage } = require("../controllers/events/DiscordMessages")
const { DiscordUserUpdate } = require("../controllers/events/DiscordUserChanges")
const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addClient } = require("../utils/dataExporter");
const {db} = require('../database/database');
let bot;

const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers

] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	updateServerInformation("0", "OFFLINE");
	addClient(client);
	loadRolsVerified();
	bot = require('./ircSystem').bot;
})

client.on('guildMemberAdd', (member) => { guildMemberAdd(member, client); });

client.on('guildMemberRemove', (member) => { guildMemberRemove(member, client, client); });
client.on('userUpdate', (oldMember, newMember) => { DiscordUserUpdate(oldMember, newMember, client); } );


client.on('messageCreate', (message) => { DiscordMessage(message, client); } );

//YOUR BOT TOKEN
client.login("ODQxODcyOTE4ODk5MzI3MDM4.G6ow7G.RdtXFB200pvliMuRe2qxjvoJWv6N7Swx6eydzk");
 
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
   
 
 exports.client = client;
 exports.updateServerInformation = updateServerInformation;
 exports.updateServerTOP = updateServerTOP;
 
async function loadRolsVerified(){
	const Guild = client.guilds.cache.get("667592360867397662"); // Getting the guild.
	const VerifiedRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("server verified"));
	
	const Members = await Guild.members.fetch();
	
	const row = await db.prepare('SELECT * FROM DiscordCodes').all();
	if ( row ) {
		row.forEach( async usr => {
			if ( usr && usr.DiscordID ) {
				let user = await Members.find(user => user.id == usr.DiscordID );
				if ( user ) {
					const VerifiedRole = Guild.roles.cache.find(role => role.name.toLowerCase().includes("server verified"));
					if ( VerifiedRole) user.roles.add(VerifiedRole);
				}

			}

		})
	}
	
}