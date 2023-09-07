const express = require('express')
const app = express()
const port = 6860
const http = require('http');
http.post = require('http-post');

const {client, updateServerInformation } = require('./discordSystem');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var request = require('request');
 
var mysocket = null;
//http://63.142.251.10:6860/sendmusicalert/
app.post( '/restartradio', (req, res) => {
	let data = {
		type: "restartradio",
	}
	if ( mysocket ) mysocket.write( JSON.stringify(data) );
	res.status(200).send({okey:true});
	
} );



					
					
app.post( '/sendmusicalert', (req, res) => {
	let {mensaje} = req.body;
	let MSGX_pt = "nova musica tocando: " + mensaje;
	let MSGX_en = "now is playing: " + mensaje;
	let MSGX_es = "ahora se esta reproduciendo: " + mensaje;
					let fecha = new Date();
					let Embed = {
					  "type": "rich",
					  "title": "BRL RADIO",
					  "description": MSGX_pt,
					  "color": 0x67f121,
					  "timestamp": fecha.toISOString(),
					}
					client.channels.cache.get("1040794996044996618").send( { embeds: [Embed] } );
					
					let musicname = mensaje.replace(/[^a-zA-Z0-9]/g,'');;
					let data = {
						type: "radiomsg",
						pt:  MSGX_pt,
						en: MSGX_en,
						es: MSGX_es,
					}
					if ( mysocket ) mysocket.write( JSON.stringify(data) );
	res.status(200).send({okey:true});
	
} );

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


exports.addXSocket = (socket) => { mysocket = socket; }


exports.addMusic = ( from, song ) => {
 	request.post('http://63.142.251.10:9921/addsong', {form: {link: song, from }}, function(error, response, body) {
		if (!error){
			let json = JSON.parse(body);

			if ( json.err ) {}
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
					
					if ( mysocket ) mysocket.write( JSON.stringify(data) );		
			}
		}
	});	
}
