var listMessages = [];

function listaMessages(){
	return listMessages;
}

function findMessage( text ){
	for ( let mensaje of listMessages.reverse() ) {
		if (  mensaje.text === text ) return mensaje; 
	}
		
}

function pushMessage( id, text)
{
	listMessages.push({ id, text })
	if ( listMessages.length > 100 ) listMessages.pop();
}

exports.getMessages = listaMessages;
exports.findMessage = findMessage;
exports.pushMessage = pushMessage;

// userReplyMessage(":speech_balloon: **=EGW=Gam!ng^Pro**: ola2",  ":speech_balloon: **=EGW=Gam!ng^Pro**: baiba baia");
// userReplyMessage(":speech_balloon: **=EGW=Gam!ng^Pro**: baiba baia", ":speech_balloon: **=EGW=Gam!ng^Pro**: baiba baia"  );