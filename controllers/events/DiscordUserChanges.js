const { getSocket } = require("../../utils/dataExporter");
const {db} = require('../../database/database');

const axios = require('axios');
const sharp = require('sharp');

exports.DiscordUserUpdate = async (oldMember, newMember, client ) =>  {
    
    if (oldMember.avatarURL() != newMember.avatarURL()) {
		const row = await db.prepare('SELECT * FROM DiscordCodes WHERE DiscordID = ?').get(newMember.id);
		if ( row ) {
			let avatar = newMember.displayAvatarURL({ size: 128, dynamic: true });
			await downloadAvatar(avatar, newMember.id);
		}
    };
}

const roundedCorners = Buffer.from(
  '<svg><rect x="0" y="0" width="128" height="128" rx="100" ry="100"/></svg>'
);

const downloadAvatar = async (url, memberId) => {
	let buffer = await getBase64(url);
	await sharp(buffer)
	.png({  quality: 10, compressionLevel: 6, adaptiveFiltering: true, force: true })
	.composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
	.toFile('./imgs/avatars/' + memberId + '.png');
	reloadAvatarList();
	return true;
}

exports.downloadAvatar = downloadAvatar;


async function getBase64(url) {
  return (await axios
    .get(url, {
      responseType: 'arraybuffer'
    })).data;
}


const avatarsFolder = './imgs/avatars';
const fs = require('fs');

function reloadAvatarList(){
	fs.readdir(avatarsFolder, (err, files) => {
		let fileList = ``;
	  files.forEach(file => {
			fileList += (fileList === `` ? "" : ",") + `"${file}"`;
	  });
  
  let code = `
			 DiscordAvatars <- [
				${fileList}
			];

			function getValidAvatar(image){
				return DiscordAvatars.find(image) != null ? image : "avatar.png";

			}
	  `
	  
		fs.writeFile('discord_mem.nut', code, function (err) {
		  if (err) throw err;
		  console.log('Discord_mem updated!');
		});
	});
}