var PouchDB = require('pouchdb');
var db = new PouchDB('chessFen');
var remoteCouch = 'http://admin:admin@localhost:5984/chess';
PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));
var Chess = require('chess.js').Chess;


module.exports = {
  createFen : function (pgn){
    const chess = new Chess()
    var chess1 = new Chess();
    const startPos = chess1.fen();
    chess.load_pgn(pgn);
    let fens = chess.history().map(move => {
        chess1.move(move);
        return chess1.fen();
      });
    fens = [startPos, ...fens];
    return JSON.stringify(fens)
}, 
addGame : function (gameString) {
    var game = {
      _id: JSON.parse(gameString).id,
      color: JSON.parse(gameString).players.white.user.id == 'a12233' ? 'white' : 'black',
      fenString : this.createFen(JSON.parse(gameString).moves),
      text: gameString
    };
    db.put(game, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a todo!');
      }
      else{
        // console.log(err)
        // if(err.status == 409){
        //     console.log(err.docId)
        //     db.upsert(err.docId, function (doc) {
        //         return {thisIs: 'awesome!'};
        //       }).then(function (res) {
        //         // success, res is {rev: '1-xxx', updated: true, id: 'myDocId'}
        //       }).catch(function (err) {
        //         // error
        //       });
        // }
      }
    });
  },

showGames: function () {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      // console.log(doc.rows)
    });
  },

sync: function () {
    var opts = {live: true};
    db.replicate.to(remoteCouch, opts);
    // db.replicate.from(remoteCouch, opts);
  },

deleteDB: function(){
  db.destroy().then(function (response) {
    // success
  }).catch(function (err) {
    console.log(err);
  });
}
}