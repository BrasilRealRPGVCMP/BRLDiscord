const request = require('request');
const { getSocket, getClient } = require("../utils/dataExporter");

exports.addMusic = ( from, song ) => {
    const client = getClient();
    const socket = getSocket();
    request.post('http://63.142.251.10:9921/addsong', {form: {link: song, from }}, function(error, response, body) {
       if (!error){
           let json = JSON.parse(body);
           if ( json.err ) {
            console.log("Error: " + err);
           }
           else { 
                   let fecha = new Date();
                   let Embed = {
                     "type": "rich",
                     "title": from + " adicionou uma música na lista de espera: " + json.song,
                     "description": "By " + from,
                     "color": 0x67f121,
                     "timestamp": fecha.toISOString(),
                   }
                   client.channels.cache.get("1040794996044996618").send( { embeds: [Embed] } );
                   
                   
                   
                   let musicname = json.song.replace(/[^a-zA-Z0-9]/g,' ');;
                   let data = {
                       type: "radiomsg",
                       pt: from + " adicionou uma musica na lista de espera: " + musicname,
                       en: from + " added to the waiting list: " + musicname,
                       es: from + " agrego a la lista de espera: " + musicname,
                   }
                   
                   if ( socket ) socket.write( JSON.stringify(data) );		
           }
       }
   });	
}


exports.sendMusicAlert = (req, res ) => {
    const client = getClient();
    let socket = getSocket();
	let {mensaje} = req.body;
    let musicname = mensaje.replace(/[^a-zA-Z0-9]/g,'');;

	let MSGX_pt = "nova musica tocando: " + musicname;
	let MSGX_en = "now is playing: " + musicname;
	let MSGX_es = "ahora se esta reproduciendo: " + musicname;

	let fecha = new Date();
	let Embed = {
	  "type": "rich",
	  "title": "BRL RADIO",
	  "description": MSGX_pt,
	  "color": 0x67f121,
	  "timestamp": fecha.toISOString(),
	}
	client.channels.cache.get("1040794996044996618").send( { embeds: [Embed] } );
	
	let data = {
		type: "radiomsg",
		pt:  MSGX_pt,
		en: MSGX_en,
		es: MSGX_es,
	}
	if ( socket ) socket.write( JSON.stringify(data) );
	res.status(200).send({okey:true});
	
}

exports.restartRadio = ( req, res ) => {
    let socket = getSocket();
    let data = { type: "restartradio" }
	if ( socket ) socket.write( JSON.stringify(data) );
	res.status(200).send({okey:true});
}