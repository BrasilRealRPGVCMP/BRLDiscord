const { getSocket } = require("../../utils/dataExporter");
const {db} = require('../../database/database');
const categoriaVerificaciones = '1127709384546471956';
const { ChannelType, PermissionFlagsBits } = require('discord.js');

exports.guildMemberAdd = async ( member, client ) => {
    try {
        const Guild = client.guilds.cache.get("667592360867397662"); 
        let channel = await Guild.channels.create({
            name: "verify-" + member.id,
            type: ChannelType.GuildText,
            parent: categoriaVerificaciones,
            permissionOverwrites: [
                {
                  id: Guild.roles.everyone.id,
                  deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                  id: member.id,
                  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                }
              ],
            });
        let key = Math.random().toString(36).slice(2, 10);

        channel.send(`**Bem-vindo ao nosso discord!** 
Para desbloquear os canais, você deve verificar sua conta do servidor com sua conta do Discord.
Para fazer isso você deve entrar no servidor e usar **/verify ${key}**

**Bienvenido a nuestro discord!** 
Para desbloquear los canales deberás verificar tu cuenta del servidor con tu cuenta de discord.
Para ello deberás ingresar al servidor y usar **/verify ${key}**

**Welcome to our Discord!** 
To unlock the channels you must verify your server account with your discord account.
To do this you must enter the server and use **/verify ${key}**`);

        let stmt = db.prepare("INSERT INTO validations VALUES( ?, ?, ? )")
        stmt.run( key, channel.id, member.id );
        stmt = null;
    }
    catch(e){
        console.error("Error en GuildMemberadd: " + e.message );
    }
}

exports.guildMemberRemove = async ( member, client ) => {
    try {
        const row = await db.prepare('SELECT * FROM validations WHERE user = ?').get(member.id);
        if ( row ) {
            let stmt = db.prepare("DELETE FROM validations WHERE user = ?")
            stmt.run( member.id )
            stmt = null;
            const fetchedChannel = await client.channels.cache.get( row.channel  );
            fetchedChannel.delete();
        }
    }
    catch(e){
        console.error("Error en GuildMemberRemove: " + e.message );
    }
}
