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

app.use('/test', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/board', express.static(__dirname + '/chessboardjs-1.0.0/'));

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)


//postgres
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'rex',
  host: 'localhost',
  database: 'chess',
  password: 'admin',
  port: 5432,
})

const getGames = (request, response) => {
    pool.query('SELECT * FROM mygames', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
async function getOneGame(id) {
    pool.query('SELECT * FROM mygames WHERE id=$1',[id], (error, results) => {
        if (error) {
            throw error
        }
        }).then(            
            console.log(results.rows[0].moves) 
        )

  }

  function insertGame(id, moves, color) {
    pool.query('INSERT INTO mygames (id, moves, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, moves, color], (error, results) => {
      if (error) {
        throw error
      }
      console.log(id)
    })
  }

app.get('/allGames', getGames);

// app.get('/newGame', function(req, res){
//     insertGame('NrVVrQqj','1. e4 e5 2. Nf3 Nc6 3. Nc3 Bc5 4. Nxe5 Nxe5 5. d4 Nd3+ 6. Qxd3 Bb4 7. a3 Bxc3+ 8. Qxc3 Nf6 9. Bd3 O-O 10. O-O d6 11. Bg5 Qe8 12. Bxf6 gxf6 13. Rae1 Qd7 14. d5 Re8 15. Qxf6 Qg4 16. Re3 b6 17. Rg3 c5 18. Rxg4+ Bxg4 19. f3 Bh5 20. g4 Bg6 21. Qxd6 Rad8 22. Qg3 Rb8 23. e5 c4 24. Bxg6 fxg6 25. c3 Red8 26. Rd1 b5 27. f4 Rdc8 28. Qh4 b4 29. axb4 Ra8 30. f5 gxf5 31. gxf5 Kh8 32. f6 a5 33. Qg4 Rg8 34. Qxg8+ Rxg8+ 35. Kh1 Rg5 36. f7 Rxe5 37. f8=Q# 1-0','white')
// });

function test(){
    const {JSDOM} = jsdom;

    var text = 
    `    <div id="myBoard" style="width: 400px"></div>
    <script src="js/jquery-3.4.1.min.js"></script>
    <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js" integrity="sha384-8Vi8VHwn3vjQ9eUHUxex3JSN/NFqUg3QbPyX8kWyb93+8AC/pPWTzj+nHtbC5bxD" crossorigin="anonymous"></script>
    <script>
    var board = Chessboard('myBoard')
    </script>`

    const dom = new JSDOM(text);
    const $ = (require('jquery'))(dom.window);
    var ruyLopez = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
    // var board = Chessboard('myBoard', ruyLopez)
}

app.get('/', async function(req, res) {
    // test()
    getOneGame('qwKH00va') 
    res.render('pages/index');
});

app.get('/board', function(req, res) {
    // test()
    var fen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
    // parsingAllGamesFiles()
    res.render('pages/board', {
        "fen":fen
    });
});

app.get('/test', async function(req, res){
    // await getLatestGame()
    // var id =''
    // let test = await (async function() {return new Promise( resolve => {request.get(lichessApi+'/games/user/a12233?max=1', function(err, res){
    //     var stringList = res.body.split('\n')
    //     for(let i = 0; i < stringList.length; i++){
    //         if(stringList[i].includes("https://lichess.org/")) {
    //             id = stringList[i].slice(-10,-2)
    //         }
    //     }
    // }).auth(null, null, true, personalToken).on('finish',resolve)});
// }) 

    const data = getOneGame('qwKH00va').then( result => 
        res.render('pages/test', {
        "data":result
    })).catch(err => console.log(err))

    

});

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
async function getLatestGame(){
     return new Promise(resolve => {
        request.get(lichessApi+'/games/user/a12233?max=1', function(err, res){
            var stringList = res.body.split('\n')
            for(let i = 0; i < stringList.length; i++){
                if(stringList[i].includes("https://lichess.org/")) {
                    var id = stringList[i].slice(-10,-2)
                    // console.log(stringList[i]+"\t"+id)
                }
                if(stringList[i].includes('a12233')) {
                    var color = stringList[i].slice(1,6).toLowerCase()  
                    // console.log(stringList[i]+"\t"+color)
                }
            }
            var moves = stringList[stringList.length-4]
            // console.log(stringList[stringList.length-4]+"\t"+moves)
            insertGame(id, moves, color);
        }).auth(null, null, true, personalToken).on('finish',resolve);
        // .pipe(fs.createWriteStream(__dirname+'/gameData/latest.txt')
     })
}

function loadOneGame(){
    fs.readFile('gameData/game.pgn', (err, data) => {
        if (err) throw err;
        // console.log(data.toString());
        var chess = new Chess(); 
        chess.load_pgn(data.toString());
        moves = chess.history()
        console.log(moves)
        var chess1 = new Chess();
        var stream = fs.createWriteStream("gameFen.txt", {flags:'a'});
        var iter = 0 
        for(var iter = 0; iter< moves.length; iter++){
            chess1.move(moves[iter]);
            fen = chess1.fen()
            stream.write(fen+"\n")
        }
        console.log(chess.fen()) //ending position 
      });
}
