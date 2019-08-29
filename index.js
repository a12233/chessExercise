const request = require('request');
const fs = require('fs');



/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)

const options = {
    url:'https://lichess.org/api/account',
    headers: { 'Authorization': 'Bearer ' + personalToken }
}
// request.get(lichessApi+'/account', function(err, res, body){ console.log(body) } ).auth(null, null, true, personalToken);


// request(options, function(error, response, body){
//     console.log(body)
//     err => console.error(err.message)
// });

const params = '?max=1'
const getGames = {
    url: lichessApi+ 'games/user/a12233'+params,
}
// headers: { 'Authorization': 'Bearer ' + personalToken,
// 'content-type' : 'application/x-ndjson' }

// request.get(getGames, function(error, response, body){
//     console.log(response)
//     // console.log(body)
//     // console.log(error)
// }).pipe(fs.createWriteStream(__dirname+'/gameData/game1.pgn'));

request.get(lichessApi+'/games/user/a12233?max=1&tags=false', function(err, res){
    console.log(res.body)
}).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/gameData/game1.pgn'));