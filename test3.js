const fs = require('fs');
const code = fs.readFileSync('base_logic.js', 'utf8');
const block = code.substring(code.indexOf('let oldName ='), code.indexOf('let item = {'));
console.log(block);
