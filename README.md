https://rexchessviz.herokuapp.com/ staging
https://chessanalysis.herokuapp.com/ production

Nodejs, Jquery, Postgres, Express application hosted on Heroku

The purpose of this application is to provide a means of generating analytics and visualization of the
chess games I play on lichess.org. 

Currently, I do a REST call to get my lastest game, store that game in Postgres, and finally display that game with PgnViewerJS. 

TODO: 
FEN frequency -- be able to see the highest frequency opening positions I end up in
DB table by color -- all white games and black games in seperate tables
Adding engine evaluation to positions
biggest change in engine eval positions flagged
Opening tables
Endgame positions won/lost


Added wasm stockfish (old version from 2018)
TODO: pgdiff of local database and heroku version

Reference Links: 
https://chess.stackexchange.com/questions/17005/engine-output-fen-string-when-blundering?rq=1
https://github.com/fsmosca/chess-artist
https://chess.stackexchange.com/questions/18182/stockfish-evaluation-of-a-position-from-pgn
https://chess.stackexchange.com/questions/5945/how-to-get-position-evaluation-with-uci
https://chess.stackexchange.com/questions/2306/playing-chess-on-a-mac-with-stockfish-and-some-gui
https://www.reddit.com/r/chess/comments/9ww1e1/looking_for_a_chess_database_that_can_make_use_of/



Also on fly.io
https://chessanalysis.fly.dev/

