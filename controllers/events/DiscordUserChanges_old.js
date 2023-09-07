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
  '<svg><rect x="0" y="0" width="128" height="128" rx="50" ry="50"/></svg>'
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
	return true;
}

exports.downloadAvatar = downloadAvatar;


async function getBase64(url) {
  return (await axios
    .get(url, {
      responseType: 'arraybuffer'
    })).data;
}