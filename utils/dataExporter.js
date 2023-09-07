var mysocket = null;
var client = null;

exports.addSocket = (soc) => {
    mysocket = soc;
}

exports.getSocket = () => {
    return mysocket;
}


exports.addClient = (soc) => {
    client = soc;
}

exports.getClient = () => {
    return client;
}