// const { workerData, parentPort } = require('worker_threads')

// // You can do any heavy stuff here, in a synchronous way
// // without blocking the "main thread"
// parentPort.postMessage({ workerData })
var Worker = require("tiny-worker");
var worker = new Worker("stockfish.js");

module.exports ={
    
}
