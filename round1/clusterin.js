#!/usr/bin/env node
const { createReadStream, stat } = require('fs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const timer = process.argv.indexOf('-t')!==-1;
const needles = {};
const start = process.hrtime();
const ns = 1e9;
let numWorkers = 0;
let killedWorkers = 0;

if (cluster.isMaster) {
  stat(needlesFile, function(error, stat) {
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
      const worker = cluster.fork(require('worker'));
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
      console.log(`${(diff[0] * ns + diff[1])/1000000000} seconds`);
    }
  }
}

function MyBuffer() {
    this._last = '';
}

let findCount = 0;
MyBuffer.prototype.onData = function(data, cb) {
    this._last += data.toString();
    const lines = this._last.split('\n');
    this._last = lines.pop();
    findCount += lines.length;
    for (let i = 0; i < lines.length; ++i) {
        cb(lines[i]);
    }
};

const find = line => {
    if (needles.hasOwnProperty(line)) {
        delete needles[line];
        process.stdout.write(line + '\n');
    }
};

const needleBuffer = new MyBuffer();

function loadNeedles() {
  createReadStream(process.argv[3], {highWaterMark: 32 * 3024})
  .on('data', chunk => needleBuffer.onData(chunk, line => {
      needles[line] = undefined;
  }))
  .on('close', () => {
      const hayBuffer = new MyBuffer();
      needles[needleBuffer._line] = undefined;

      process.stdin.on('readable', function () {
          let chunk;
          while ((chunk = this.read()) !== null) {
              hayBuffer.onData(chunk, find);
          }
      }).on('close',()=>{
        process.kill(process.pid);
      });
  })
}

