
const Database = require('better-sqlite3');
const db = new Database('./database/Discord.db', { });

exports.db = db;