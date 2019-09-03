const request = require('request');
const fs = require('fs');
const express = require('express')
const app = express()
const port = 3000;
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
    res.render('pages/index');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)

request.get(lichessApi+'/account', function(err, res, body){ 
    obj = JSON.parse(body)
    console.log(obj.id + "\nclassical:"+obj.perfs.classical.rating + "\trapid:"+obj.perfs.rapid.rating)
}).auth(null, null, true, personalToken);


function getAllMyGames(){
    request.get(lichessApi+'/games/user/a12233', function(err, res){
        console.log(res.body)
    }).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/gameData/game2.pgn'));
}
