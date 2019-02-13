#!/usr/bin/env node
const { createReadStream } = require('fs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
// const numCPUs = 3;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const timer = process.argv.indexOf('-t')!==-1;
const needles = {};
const start = process.hrtime();
const ns = 1e9;
let numWorkers = 0;
let killedWorkers = 0;
let totalSearchedLines = 0;
let totalLinesFound = 0;
if (cluster.isMaster) {
  
  for (var i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.on('exit',killedWorker);
    worker.on('message', (val)=>{
      totalSearchedLines += val.numSearched;
      totalLinesFound += val.numFound;
    });
    worker.send({index: i });
    numWorkers++;
  }

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
    console.log({totalSearchedLines, totalLinesFound})
  }
}

function MyBuffer() {
    this._last = '';
}

MyBuffer.prototype.onData = function(data, cb) {
    this._last += data.toString();
    const lines = this._last.split('\n');
    this._last = lines.pop();
    for (let i = 0; i < lines.length; ++i) {
        cb(lines[i]);
    }
};

const find = line => {
  numSearched ++;
    if (needles.hasOwnProperty(line)) {
      numFound++;
      delete needles[line];
      process.stdout.write(line + '\n');
    }
};

const needleBuffer = new MyBuffer();
let numNeedles = 0;
let numFound = 0;
let numSearched = 0;
function loadNeedles() {
  createReadStream(needlesFile, {highWaterMark: 32 * 3024})
  .on('data', chunk => needleBuffer.onData(chunk, line => {
      needles[line] = undefined;
      numNeedles++;
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
      process.send({
        numSearched,
        numFound,
        numNeedles
      });
      process.kill(process.pid);
    });
  })
}

