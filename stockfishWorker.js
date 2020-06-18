var tinyWorker = require("tiny-worker");
var tinyworker = new tinyWorker("stockfish.js");
const { Worker, parentPort, workerData, threadId } = require('worker_threads')

var outputObj = {
  depth: '',
  multipv: '',
  score: '',
  moves: [],
  fen: '',
  seldepth: '',
  time: ''
}
var outputMap = new Map()
var outputList = []; 

stockfishWebWorker();
parentPort.postMessage("Thread "+threadId+" is ready for analysis || creating child process pid:"+tinyworker.child.pid)
tinyworker.postMessage('setoption name Ponder value false');
tinyworker.postMessage('setoption name MultiPV value 3');
// console.time('search duration')

//Parent Thread will send a FEN position and evaluation depth 
workerData.data.forEach(i => {
  if(i.includes("fen")){
    outputObj.fen = i.split(" ").splice(2).join(" ")
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
            else if ( i == 'seldepth'){
              outputObj.seldepth = iterArray[index+1]
            }
            else if (i == 'time'){
              outputObj.time = iterArray[index+1]
            }
          })
          // console.log(event.data);
          // outputList.push(outputObj)
          if(outputMap[outputObj.fen] == undefined){
            outputMap[outputObj.fen] = new Map()
            outputMap[outputObj.fen].set(outputObj.multipv, outputObj)
            console.log(outputObj.fen + "|| "+ "multipv: "+outputObj.multipv)
          }else{
            outputMap[outputObj.fen].set(outputObj.multipv, outputObj) 
            console.log(outputObj.fen + "|| "+ "multipv: "+outputObj.multipv)
          }
          //multipv == 3
          if(outputMap[outputObj.fen].size == 3){
            console.log("multipv 3 finished")
            parentPort.postMessage(Object.fromEntries(outputMap[outputObj.fen]))
            return
          }
          // console.timeEnd('search duration')
      }
      // console.log(event.data);
  };
}



