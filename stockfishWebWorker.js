var tinyWorker = require("tiny-worker");
var worker = new tinyWorker("stockfish.js");
const { parentPort, workerData } = require('worker_threads')

var outputObj = {
  depth: '',
  multipv: '',
  score: '',
  moves: [] 
}

parentPort.postMessage("Ready for Analysis")
// parentPort.on('message', msg => {
//   worker.postMessage(msg)
//   // console.log(msg)
// })

//Parent Thread will send a FEN position and evaluation depth 
workerData.data.forEach(i => {
  console.log(i)
  worker.postMessage(i)
})

function stockfishWebWorker(){
  worker.onmessage = function (event) {
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
          })
          console.log(event.data);

          parentPort.postMessage(JSON.stringify(outputObj))
      }
      // console.log(event.data);
  };
}

stockfishWebWorker();
worker.postMessage('setoption name Ponder value false');
// worker.postMessage('setoption name MultiPV value 3');

