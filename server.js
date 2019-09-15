const request = require('request');
const fs = require('fs');
const express = require('express')
var Chess = require('chess.js').Chess;
var Fgets = require('qfgets');
var readline = require('linebyline');
const app = express()
const port = 3000;
app.set('view engine', 'ejs');
const jsdom = require('jsdom')
// const db = require('./query.js')
// const https = require('https');


app.use('/test', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/board', express.static(__dirname + '/chessboardjs-1.0.0/'));

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)


//postgres

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'rex',
//   host: 'localhost',
//   database: 'chess',
//   password: 'admin',
//   port: 5432,
// })

const getGames = (request, response) => {
    try{
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM mygames');
        const results = { 'results': (result) ? result.rows : null};
        response.status(200).json(results.rows)
        client.release();
    }catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
    // pool.query('SELECT * FROM mygames', (error, results) => {
    //   if (error) {
    //     throw error
    //   }
    //   response.status(200).json(results.rows)
    // })
  }

function insertGame(id, moves, color) {
    pool.query('INSERT INTO mygames (id, moves, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, color], (error, results) => {
        if (error) {
        throw error
        }
    })
}
app.get('/allGames', getGames);

app.get('/', async function(req, res) {
    res.render('pages/index');
});

app.get('/test', async function(req, res) {
    res.render('pages/test');
});


app.get('/board', function(req, res) {
    var fen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
    res.render('pages/board', {
        "fen":fen
    });
});

app.get('/latestGame', async (req, res) => {
    var id = 'qwKH00va'
    id = await getLatestGame() 
    const data = await pool.query('SELECT * FROM mygames WHERE id=$1', [id]);         
    return res.render('pages/latestGame', {
            "data":data.rows[0].moves
        })
});

 function getLatestGame(){
    return new Promise( (resolve) => {
        const options = {
            url: lichessApi+'/games/user/a12233?max=1',
            headers: {
                'Accept': 'application/x-ndjson'
            }
          };
        var id = ' '
        request.get(options, (err, res)=> {
            id = JSON.parse(res.body).id
            var moves = JSON.parse(res.body).moves
            var color = ''
            if(JSON.parse(res.body).players.white.user.id == 'a12233') color = 'white'
            else color = 'black'
            insertGame(id, moves, color);
            resolve(id)
        })
     })
}
const oneGame = (request, response, id) => {
    pool.query('SELECT * FROM mygames WHERE id=$1',[id], (error, results) => {
        if (error) {
            throw error
        }
        // console.log(results.rows[0].moves) 
        })         
  }

// app.get('/game', function(req, res) {
//     loadOneGame()
//     res.status(200).json({message: "creating fen table"});
// });

function getAccountDetails(){
    request.get(lichessApi+'/account', function(err, res, body){ 
        obj = JSON.parse(body)
        console.log(obj.id + "\nclassical:"+obj.perfs.classical.rating + "\trapid:"+obj.perfs.rapid.rating)
    }).auth(null, null, true, personalToken);
}


function getAllMyGames(){
    request.get(lichessApi+'/games/user/a12233', function(err, res){
        console.log(res.body)
    }).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/gameData/allgames.txt'));
}
//extract relevant data and write to another file, eventually write to DB 
function parsingAllGamesFiles(){
    var fp = new Fgets('gameData/allgames.txt');
    var contents = "";
    return readlines();
    function readlines() {
        try {
            for (var i=0; i<20; i++) { //lines per game
                var line = fp.fgets();
                contents += line;
                if (line.includes("Site") ) console.log(line); //get gameId
            }
            if (fp.feof()) return callback(null, contents);
            else setImmediate(readlines);
        }
        catch (err) {
            return callback(err);
        }
    }
    function callback(a, b){
        // console.log(a+b)
    }
}

