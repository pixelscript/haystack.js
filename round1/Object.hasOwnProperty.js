#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const needles = {};
const ns = 1e9;
const needlesFile = process.argv[process.argv.indexOf('--needles') + 1];
const showTimer = process.argv.indexOf('-t')!==-1;
const start = process.hrtime();
readline.createInterface({ input: fs.createReadStream(needlesFile) })
  .on('line', line => needles[line]=undefined)
  .on('close', line => findNeedles(line));

function findNeedles() {
  readline
    .createInterface({ input: process.stdin })
    .on('line', line => {
      if (needles.hasOwnProperty(line)) {
        delete needles[line];
        console.log(line);
      }
    })
    .on('close',()=>{
      if(showTimer){
        const diff = process.hrtime(start);
        console.log(`${diff[0] * ns + diff[1]} nanoseconds`);
      }
    })
}