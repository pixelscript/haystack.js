const {LineCounter} = require('chunking-streams');
const {createReadStream} = require('fs');
let needles = {};
let nchunker = new LineCounter({
  numLines: 1,
  flushTail: true
});
let hchunker = new LineCounter({
  numLines: 1,
  flushTail: true
});
let countNeedles = 0;
let countHaystack = 0;
createReadStream(process.argv[5]).pipe(nchunker).on('data',l=>{
  needles[String(l.slice(0,-1))]=undefined;
  countNeedles++;
}).on('end',start);

function find(line) {
  if(needles.hasOwnProperty(line)){
    console.log(line);
  }
}

function start() {
  process.stdin.pipe(hchunker)
  .on('data',l=>{
    console.log(l.toString());
    find(l.toString().slice(0,-1));
    countHaystack++;
  })
  .on('end',()=>{
    process.send({
      pid: process.pid,
      countNeedles,
      countHaystack
    });
    process.exit();
  })
}
