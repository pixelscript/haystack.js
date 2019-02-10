#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const needles = new Map();
const ns = 1e9;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const showTimer = process.argv.indexOf('-t')!==-1;
const start = process.hrtime();
readline.createInterface({ input: fs.createReadStream(needlesFile) })
  .on('line', line => needles.set(line))
  .on('close', line => findNeedles(line));

function findNeedles() {
  readline
    .createInterface({ input: process.stdin })
    .on('line', line => {
      if (needles.has(line)) {
        needles.delete(line);
        console.log(line);
      }
    })
    .on('close',()=>{
      if(showTimer){
        const diff = process.hrtime(start);
        console.log(`Object took ${diff[0] * ns + diff[1]} nanoseconds`);
      }
    })
}