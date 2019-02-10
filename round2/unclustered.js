#!/usr/bin/env node
const start = process.hrtime();
const fs = require('fs');
const readline = require('readline');
const ns = 1e9;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const haystackFile = process.argv[process.argv.indexOf('--haystack') + 1];
const timer = process.argv.indexOf('-t')!==-1;
const needles = {};
readline.createInterface({ input: fs.createReadStream(needlesFile) })
  .on('line', line => needles[line]=undefined)
  .on('close', line => findNeedles(line));

function findNeedles() {
  readline
    .createInterface({
      input: fs.createReadStream(haystackFile)
    })
    .on('line', l=>{
      if (needles.hasOwnProperty(l)) {
        delete needles[l];
        console.log(l);
      }
    })
    .on('close',()=>{
      if(timer){
        const diff = process.hrtime(start);
        console.log(`Object took ${diff[0] * ns + diff[1]} nanoseconds`);
      }
    })
}