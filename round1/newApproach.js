#!/usr/bin/env node
const { fork } = require('child_process');
// const fs = require('fs');
const { createWriteStream, createReadStream, open } = require('fs');
const split2 = require('split2');
const temp = createWriteStream('.temp');
const timer = process.argv.indexOf('-t')!==-1;
const start = process.hrtime();
const {LineCounter} = require('chunking-streams');
const stream = require('stream');
const ns = 1e9;
const threads = [];
const numThreads = 1;
let numKilled = 0;

let chunker = new LineCounter({
  numLines: 1,
  flushTail: true
});

function killed(){
  numKilled++;
  if (numKilled == numThreads){
    if(timer){
      const diff = process.hrtime(start);
      console.log(`${(diff[0] * ns + diff[1])/1000000000} seconds`);
    }
  }
}
a = open();
let thing = process.stdin.pipe(chunker);
thing.fd = 4;
for(i=0; i<numThreads; i++) {
  let thread = fork(__dirname+'/childProcess',process.argv,{
    stdio: [thing,process.stdout,process.stderr,'ipc']
  });
  thread.on('message',msg=>{
    console.log(msg);
  });
  thread.on('exit',killed)
  threads.push(thread);
}

