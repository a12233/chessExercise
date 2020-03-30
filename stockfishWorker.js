var tinyWorker = require("tiny-worker");
var tinyworker = new tinyWorker("stockfish.js");
const { Worker, parentPort, workerData, threadId } = require('worker_threads')

var outputObj = {
  depth: '',
  multipv: '',
  score: '',
  moves: [],
  fen: ''
}
stockfishWebWorker();

parentPort.postMessage("Thread "+threadId+" is ready for analysis")
tinyworker.postMessage('setoption name Ponder value false');
tinyworker.postMessage('setoption name MultiPV value 3');
// console.time('search duration')

//Parent Thread will send a FEN position and evaluation depth 
workerData.data.forEach(i => {
  if(i.includes("fen")){
    outputObj.fen = i
  }
  tinyworker.postMessage(i)
})

function stockfishWebWorker(){
  tinyworker.onmessage = function (event) {
      let tempArr = event.data.split(" ")
      if (event.data.search(/^bestmove/) !== -1) {
          var move = event.data;
          // parentPort.postMessage(move)
      }
      if (event.data.search(/^info/) !== -1 && tempArr[2] == 20) {
          let temp = event.data
          let tempArr = temp.split(" ")
          tempArr.forEach( (i, index, iterArray) => {
            if(i === 'depth'){
              outputObj.depth = iterArray[index+1]
            }
            else if( i === 'score'){
              outputObj.score = iterArray[index+1]+"|"+iterArray[index+2]
            }
            else if( i === 'pv'){
              outputObj.moves = iterArray.splice(index)
            }
            else if ( i == 'multipv'){
              outputObj.multipv = iterArray[index+1]
            }
          })
          // console.log(event.data);
          parentPort.postMessage(JSON.stringify(outputObj))
          // console.timeEnd('search duration')

      }
      // console.log(event.data);
  };
}



