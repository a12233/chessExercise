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
app.use('/latestGame', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/board', express.static(__dirname + '/chessboardjs-1.0.0/'));

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)

const env = process.env.NODE_ENV || 'local';


//postgres

const { Pool } = require('pg');
let connectionString = {};
if (env === 'local') {
    connectionString = {
        user: 'rex',
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

const getGames = async (request, response) => {
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
    return new Promise( (resolve)=>{
        pool.query('INSERT INTO mygames (id, moves, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, color], (error, results) => {
            if (error) {
            throw error
            }
        })
        resolve("done")
    })

}
// app.get('/allGames', getGames);
app.get('/db', async (req, res) => {
    try {
    const data = await pool.query('SELECT * FROM mygames');         
      res.render('pages/games', {"gameData": data.rows}) 
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

app.get('/', async function(req, res) {
    // getAllMyGames()

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

app.get('/refreshDB', (req, res)=>{
    refreshDB()
});

app.get('/latestGame', async (req, res) => {
    var id = 'qwKH00va'
    id = await getLatestGame() 
    const data = await pool.query('SELECT * FROM mygames WHERE id=$1', [id]); 
    return res.render('pages/latestGame', {
            "data":data.rows[0].moves,
            "color":data.rows[0].color
        })
});
function refreshDB() {
    parsingAllGamesFiles()
}

function getLatestGame(){
    return new Promise( (resolve) => {
        const options = {
            url: lichessApi+'/games/user/a12233?max=1',
            headers: {
                'Accept': 'application/x-ndjson'
            }
          };
        var id = ' '
        request.get(options, async (err, res)=> {
            id = JSON.parse(res.body).id
            var moves = JSON.parse(res.body).moves
            var color = ''
            if(JSON.parse(res.body).players.white.user.id == 'a12233') color = 'white'
            else color = 'black'
            await insertGame(id, moves, color);
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
    return new Promise((resolve)=>{
        const options = {
            url: lichessApi+'/games/user/a12233?perfType=rapid,classical&opening=true',
            headers: {
                'Accept': 'application/x-ndjson'
            }
          };
        request.get(options, function(err, res){
            var obj = res.body
        }).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/gameData/testGames.txt'));
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
//extract relevant data and write to another file, eventually write to DB 
function parsingAllGamesFiles(){
    var data = fs.readFileSync('gameData/10games.txt');
    var jsonData = JSON.parse(data)
    for(let i = 0; i < jsonData.length ; i++){
        var obj = jsonData[i]
        var color = ''
        if(obj.players.white.user.id == 'a12233') color = 'white'
        else color = 'black'
        insertAllGames(obj.id, obj.moves, color, obj)
    }

}

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