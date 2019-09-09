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
app.use('/test', express.static(__dirname + '/PgnViewerJS-0.9.8'));
app.use('/board', express.static(__dirname + '/chessboardjs-1.0.0/'));




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

app.get('/', function(req, res) {
    // test()
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

app.get('/test',  async function(req, res){
    var data = ''
    await getLatestGame()
    data = await fs.readFileSync(__dirname+'/gameData/latest.txt'), (err, data) => {
        if (err) throw err;
        return data 
    }
    res.render('pages/test', {
        "data":data.toString('ascii').trim()
    })

});

app.get('/game', function(req, res) {
    loadOneGame()
    res.status(200).json({message: "creating fen table"});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/* Create your personal token on https://lichess.org/account/oauth/token */
const personalToken = 'c1y34MTOM1IGp3i9';
const lichessApi = 'https://lichess.org/api'

console.log(__filename)
console.log(__dirname)

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
        request.get(lichessApi+'/games/user/a12233?max=1&tags=false', function(err, res){
            // console.log("test")
        }).auth(null, null, true, personalToken).pipe(fs.createWriteStream(__dirname+'/gameData/latest.txt').on('finish',resolve));
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
