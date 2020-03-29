const request = require('request-promise');
const fs = require('fs');
const express = require('express')
var Chess = require('chess.js').Chess;
var Fgets = require('qfgets');
var LineByLineReader = require('line-by-line');
const app = express()
const port = 3000;
app.set('view engine', 'ejs');
const jsdom = require('jsdom')
var Worker = require("tiny-worker");
var worker = new Worker("stockfish.js");
var eval = require('./backend/services/fenEval.js')
// const { Worker } = require('worker_threads');
// const { workerData, parentPort } = require('worker_threads')

// const db = require('./query.js')
// const https = require('https');
let pouch = require('./pouchDb.js');

app.use('/test', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/latestGame', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/board', express.static(__dirname + '/chessboardjs-1.0.0/'));
app.use('/playStockfish', express.static(__dirname + '/chessboardjs-1.0.0/'));
app.use('/playStockfish', express.static(__dirname ));



app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
// const personalTokenTest = 'S5zRQ8u1Annr2LUA'
const username = 'a12233'//'a12233_test'
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)

const env = process.env.NODE_ENV || 'local';


//postgres

const { Pool } = require('pg');
let connectionString = {};
if (env === 'local') {
    connectionString = {
        user: 'postgres',
        host: 'localhost',
        database: 'chess',
        password: 'admin',
        port: 5432,
      };
} else {
    connectionString = {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    };
}
const pool = new Pool(connectionString);
// pool.on('connect', () => console.log('connected to db'));


// app.get('/allGames', getGames);
app.get('/playStockfish', async (req, res) => {
    try {
          res.render('pages/playStockfish') 
        } catch (err) {
          console.error(err);
          res.send("Error " + err);
        }
})

app.get('/db', async (req, res) => {
    try {
    const data = await pool.query('SELECT * FROM mygames');         
      res.render('pages/games', {"gameData": data.rows}) 
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});

app.get('/white', async (req, res) => {
    try {
    const data = await pool.query('SELECT * FROM whiteGames');         
    res.render('pages/color', {"gameData": data.rows}) 
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

app.get('/black', async (req, res) => {
try {
const data = await pool.query('SELECT * FROM blackGames');         
    res.render('pages/color', {"gameData": data.rows}) 
} catch (err) {
    console.error(err);
    res.send("Error " + err);
}
})

app.get('/', async function(req, res) {
    // initStockfishWebWorker()
    // worker.postMessage('go movetime ' + '1000');
    let uciArray = ['position fen r1b3rk/3pb2n/2p4P/p3p3/4P3/2NpB3/PPP2P2/2K3R1 w - - 0 22', 'go ponder depth 20']
    eval.evaluate(uciArray); 
    res.render('pages/index');
});

app.get('/test', async function(req, res) {
    res.render('pages/test');
});


app.get('/board', function(req, res) {
    // var fen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
    var fen = 'r1b3rk/3pb2n/2p4P/p3p3/4P3/2NpB3/PPP2P2/2K3R1 w - - 0 22'
    res.render('pages/board', {
        "fen":fen
    });
});

app.get('/api/refreshDB', (req, res)=>{
    refreshDB()
});

// app.get('/viz', (req, res)=>{
//     res.render('pages/viz');
// });

app.get('/latestGame', async (req, res) => {
    let id = await getLatestGame() 
    const data = await pool.query('SELECT * FROM mygames WHERE id=$1', [id]); 
    return res.render('pages/latestGame', {
            "data":data.rows[0].moves,
            "color":data.rows[0].color
        })
});
async function refreshDB() {
    let filepath = 'gameData/mar2020.pgn'
    // parsingAllGamesFiles(filepath)
    await getAllMyGames(filepath)
    uploadToPouch(filepath)
}
function uploadToPouch(filepath){
    lr = new LineByLineReader(filepath);
    lr.on('error', function (err) {
       console.log(err)
    });

    lr.on('line', function (line) {
        // pause emitting of lines...
        lr.pause();

        // ...do your asynchronous line processing..
        setTimeout(function () {
            pouch.addGame(line)
            // ...and continue emitting lines.
            lr.resume();
        }, 100);
    });

    lr.on('end', function () {
        console.log("done uploading")
    });
}
//get lastest game from lichess api, insert into postgresDB, then send moves data to be displayed 
function getLatestGame(){
    return new Promise( (resolve) => {
        const options = {
            url: lichessApi+'/games/user/'+username+'?max=1',
            headers: {
                'Accept': 'application/x-ndjson'
            },
            json: true
          };
        request(options)
        .then( async (response)=> {
            id = response.id
            var moves = response.moves
            var color = ''
            if(response.player == undefined || response.player == undefined){
                color = 'test'
            }
            else if(response.players.white.user.id == username){ 
                color = 'white' 
            }
            else {
                color = 'black'
            }
            try {
                 flag = await pool.query('INSERT INTO mygames (id, moves, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, color])
                 if(flag) {
                    resolve(id) 
                }
            }catch (e){
                console.log(e.stack)
                reject(e.stack)
            }

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

//lichess api for restreaming games into file 
function getAllMyGames(filepath){
    return new Promise((resolve)=>{
        const options = {
            url: lichessApi+'/games/user/'+username+'?perfType=rapid,classical&opening=true',
            headers: {
                'Accept': 'application/x-ndjson'
            }
          };
        request.get(options, function(err, res){
            var obj = res.body
        }).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/'+filepath));
        resolve('done')
    })
}

function insertAllGames(id, moves, color, data ) {
    return new Promise( (resolve)=>{
        pool.query('INSERT INTO games (id, moves, color, data) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [id, moves, color, data], (error, results) => {
            
            if (error) {
                throw error
            }
        })
        resolve("done")
    })

}
//extract relevant data and write to another file, eventually write to postgres DB 
async function parsingAllGamesFiles(filepath){
    
    lr = new LineByLineReader(filepath);
    lr.on('error', function (err) {
       console.log(err)
    });

    lr.on('line', function (line) {
        // pause emitting of lines...
        lr.pause();

        // ...do your asynchronous line processing..
        setTimeout(async function () {
            var jsonData = JSON.parse(line)
            if(jsonData.players.white.user.id == 'a12233') color = 'white' 
            else color = 'black'
            try {
                await pool.query('INSERT INTO games (id, moves, color, data) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [jsonData.id, jsonData.moves, color, jsonData])
            } 
            catch (e){
                console.log(e.stack)
            }
            // ...and continue emitting lines.
            lr.resume();
        }, 100);
    });

    lr.on('end', function () {
        console.log("done uploading")
    });
}
//split games by color 
async function splitGames(){
    const data = await pool.query('SELECT * FROM games');     
    // console.log(data.rowCount)
    // console.log(data.rows[0])
    for( let i = 0; i < data.rowCount; i++){
        var obj = data.rows[i]
        if(obj.color == "white"){
            await insertWhiteGames(obj.id, obj.moves, obj.data)
        }
        else{
            await insertBlackGames(obj.id, obj.moves, obj.data)
        }
    }
}
function insertWhiteGames(id, moves, data ) {
    return new Promise( (resolve)=>{
        pool.query('INSERT INTO whiteGames (id, moves, data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, data], (error, results) => {
            
            if (error) {
                throw error
            }
        })
        resolve("done")
    })
}
function insertBlackGames(id, moves, data ) {
    return new Promise( (resolve)=>{
        pool.query('INSERT INTO blackGames (id, moves, data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, data], (error, results) => {
            
            if (error) {
                throw error
            }
        })
        resolve("done")
    })
}

//generate data on the frequency of fen position for the first 20 moves of my games
function fenFrequency(){

}
//read file streaming 
function testFgets(){
    var fp = new Fgets('gameData/10games.txt');
    var contents = "";
    return readlines();
    function readlines() {
        try {
            for (var i=0; i<20; i++) { //one game per line 
                var line = fp.fgets();
                var obj = JSON.parse(line)
                var id = obj.id
                var data = line
                var moves = obj.moves
                var color = obj.players.white.user.id
                insertAllGames(id, moves, color, data)
            }
            if (fp.feof()) return callback(null, contents);
            else setImmediate(readlines);
        }
        catch (err) {
            return callback(err);
        }
    }
    function callback(a){
        console.log(a)
    }
}


function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./stockfish.js', { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}

async function run() {
  const result = await runService('world')
  console.log(result);
}

function initStockfishWebWorker(){
    stockfishWebWorker();
    worker.postMessage('setoption name Ponder value false');
    worker.postMessage('setoption name MultiPV value 3');
    worker.postMessage('position fen r1b3rk/3pb2n/2p4P/p3p3/4P3/2NpB3/PPP2P2/2K3R1 w - - 0 22');
}

function stockfishWebWorker(){
    worker.onmessage = function (event) {
        if (event.data.search(/^bestmove/) !== -1) {
            var move = event.data;
            // console.log(move)
        }
        if (event.data.search(/^info/) !== -1) {
            // var move = event.data;
            // console.log(move)
            //info depth 12 seldepth 22 multipv 1 score cp -832 nodes 241951 nps 240987 hashfull 113 tbhits 0 time 1004 pv g1g8 h8g8 c2d3 c8a6 c1d2 h7g5 c3a4 g8h7 a4c5 e7c5 e3c5 h7h6 c5b6 g5f3 d2e2
        }
        console.log(event.data);
    };
}