const {Worker, isMainThread, parentPort, workerData, threadId} = require('worker_threads');


let fenString = "[\"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\",\"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1\",\"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2\",\"rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2\",\"r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3\",\"r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3\",\"r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4\",\"r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4\",\"r1bqkbnr/pppp1ppp/8/8/3nP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5\",\"r1bqkbnr/pppp1ppp/8/8/3QP3/8/PPP2PPP/RNB1KB1R b KQkq - 0 5\",\"r1bqkbnr/pp1p1ppp/8/2p5/3QP3/8/PPP2PPP/RNB1KB1R w KQkq c6 0 6\"]"

// let uciArray = ['position fen r1b3rk/3pb2n/2p4P/p3p3/4P3/2NpB3/PPP2P2/2K3R1 w - - 0 22',
// 'go ponder depth 20']
function createWorker (id, index) {
    const worker = new Worker('./worker.js', { workerData: { id, index } })
    worker.on('error', (err) => { throw err })
    worker.on('message', callback)
    return worker
  }

function callback(){
    console.log("Listener removed")
}

function done (workerArray) {
    workerArray.forEach(i => {
        i.removeListener('message', callback)
        i.unref()
    })
}
module.exports ={
    evaluate: function (uciArray, workerArray){
        if (isMainThread) {
            if(workerArray < 5){
                const worker = new Worker('./stockfishWorker.js', {workerData :{data: uciArray}});
                workerArray.push(worker)
                worker.on('message', (msg) => {
                    console.log(msg)
                })
            }
            else{
                console.log("Waiting worker threads | currently at " + workerArray.length)
            }

        } 
    },
    finish: function(){
        done()
    }
}