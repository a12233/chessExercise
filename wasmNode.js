// const fs = require('fs');
// const buf = fs.readFileSync('./stockfish.wasm');
const { Worker } = require('worker_threads');

// const lib = await WebAssembly.instantiate(new Uint8Array(buf)).
//   then(res => res.instance.exports);
function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./stockfish.js', { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}

async function run() {
  const result = await runService('uci')
  console.log(result);
}

run().catch(err => console.error(err))



