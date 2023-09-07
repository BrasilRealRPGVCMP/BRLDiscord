const express = require('express')
const app = express()
const port = 6860
const bodyParser = require('body-parser');
const http = require('http');
http.post = require('http-post');

const { restartRadio, sendMusicAlert } = require('./controllers/RadioSystem');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.post( '/restartradio', (req, res) => { restartRadio(req, res); } );

app.post( '/sendmusicalert', (req, res) => { sendMusicAlert(req, res); } );

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
