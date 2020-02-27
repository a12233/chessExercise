var PouchDB = require('pouchdb');
var db = new PouchDB('my_database');
var remoteCouch = 'http://admin:admin@localhost:5984/chess';
PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));
module.exports = {
addGame : function (gameString) {
    var game = {
      _id: JSON.parse(gameString).id,
      color: JSON.parse(gameString).players.white.user.id == 'a12233' ? 'white' : 'black',
      text: gameString
    };
    db.put(game, function callback(err, result) {
      if (!err) {
        // console.log('Successfully posted a todo!');
      }
      else{
        // console.log(err)
        if(err.status == 409){
            console.log(err.docId)
            // db.upsert(err.docId, function (doc) {
            //     return {thisIs: 'awesome!'};
            //   }).then(function (res) {
            //     // success, res is {rev: '1-xxx', updated: true, id: 'myDocId'}
            //   }).catch(function (err) {
            //     // error
            //   });
        }
      }
    });
  },

showGames: function () {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      console.log(doc.rows)
    });
  },

sync: function () {
    var opts = {live: true};
    db.replicate.to(remoteCouch, opts);
    db.replicate.from(remoteCouch, opts);
  }
}