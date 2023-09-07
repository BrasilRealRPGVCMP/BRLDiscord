const { profileImage } = require('discord-arts');
const {db} = require('../database/database');

exports.generateDMCard = async ( username, matou, morreu, spree, weapons, rowid, fecha, userid ) => {
	return	profileImage( userid, {
	  username: username,
	  customBackground: await getUserBackground(userid),
	  customBadges: [ ...getWeaponsFormat(weapons) ],
	  usernameColor: '#ffbddf',
	  borderColor: '#fe6a90',
	  presenceStatus: 'online',
	  badgesFrame: true,
	  fechaRegistro: "Since "+ fecha.split(" - ")[0].split("/")[2],
	  rankData: {
		currentXp: matou, 
		requiredXp: morreu,
		rank: rowid,
		level: spree,
		barColor: 'ff9d88'
	  }
	});
	
}
async function getUserBackground(userid){
	
	const row = await db.prepare('SELECT * FROM CardDecoration WHERE userID = ?').get(userid);
	if ( !row || row.Background === 0 ) {
		switch(userid){		
			case "481999156823719958":
				return './imgs/levi.jpg' ; 
			case "403923375673573376":
				return './imgs/op.jpg' ;
			case "739293020276523029":
				return "./imgs/yuri.png";
			case "608814507095097373":
				return "./imgs/aro.jpg";
			case "308666043751071745": return "./imgs/rorro.png";
			default:
				return './imgs/background1.jpg'	
		}	
	}
	else {
		switch(row.Background){
			case 1: return "./imgs/backgrounds/banner1.png";
			case 2: return "./imgs/backgrounds/banner2.jpg";
			case 3: return "./imgs/backgrounds/banner3.jpg";
			case 4: return "./imgs/backgrounds/banner4.jpg";
			case 5: return "./imgs/backgrounds/banner5.jpg";
			case 6: return "./imgs/backgrounds/banner6.jpg";
			case 7: return "./imgs/backgrounds/banner7.jpg";
			case 8: return "./imgs/backgrounds/banner8.png";
			case 9: return "./imgs/backgrounds/banner9.jpg";
			case 10: return "./imgs/backgrounds/banner10.jpg";
			case 11: return "./imgs/backgrounds/banner11.jpg";
			case 12: return "./imgs/backgrounds/banner12.jpg";
			case 13: return "./imgs/backgrounds/banner13.jpg";
			case 14: return "./imgs/backgrounds/banner14.jpg";

			default:
				return './imgs/background1.jpg'	
		}
		
	}
	

	
}

function getWeaponsFormat(weapons){
	
	return weapons.split(" ").map( ( id ) => { return './imgs/armas/' + id + '.png'; } ).filter( id => id != './imgs/armas/.png' )
	
}