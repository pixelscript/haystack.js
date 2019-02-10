#!/usr/bin/env node
const start = process.hrtime();
const ns = 1e9;
const fs = require('fs');
const readline = require('readline');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const haystackFile = process.argv[process.argv.indexOf('--haystack') + 1];
const timer = process.argv.indexOf('-t')!==-1;
const needles = {};
let numWorkers = 0;
let killedWorkers = 0;

if (cluster.isMaster) {
  fs.stat(haystackFile, function(error, stat) {
    if (error) { throw error; }
    let chunkTotal = 0;
    if(stat.size>numCPUs) {
      for (var i = 0; i < numCPUs; i++) {
        const chunkSize = Math.ceil(stat.size/numCPUs);
        const remainingSize = stat.size-chunkTotal;
        const chunk = Math.min(chunkSize,remainingSize);
        if(remainingSize<=0) {
          break;
        }
        const worker = cluster.fork();
        worker.on('exit',killedWorker);
        worker.send({index: i, start: chunkTotal, chunkSize: chunk });
        numWorkers++;
        chunkTotal += chunk;
      }
    } else {
      const worker = cluster.fork();
      numWorkers = 1;
      worker.on('exit',killedWorker);
      worker.send({index: 0, chunkSize: stat.size});
    }
  });
} else {
  process.on('message', loadNeedles);
}

function killedWorker() {
  killedWorkers++;
  if (killedWorkers === numWorkers){
    if(timer){
      const diff = process.hrtime(start);
      console.log(`Object took ${diff[0] * ns + diff[1]} nanoseconds`);
    }
  }
}

function loadNeedles(setup) {
  readline.createInterface({ input: fs.createReadStream(needlesFile) })
  .on('line', line => needles[line]=undefined)
  .on('close', ()=> {
    loadHaystack(setup);
  });
}

function loadHaystack(setup) {
  readline.createInterface({
    input: fs.createReadStream(haystackFile, {
    start:setup.start,
    end:setup.start+setup.chunkSize-1})
  })
  .on('line', function(line) {
    if (needles.hasOwnProperty(line)) {
      delete needles[line];
      console.log(line);
    }
  })
  .on('close',function(){
    process.kill(process.pid);
  })
}