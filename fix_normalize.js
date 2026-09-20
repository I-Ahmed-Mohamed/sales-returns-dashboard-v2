const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

const normalizeCode = `
    // Normalize all extra spaces
    if (newName) newName = newName.replace(/\\s+/g, ' ').trim();
    if (oldName) oldName = oldName.replace(/\\s+/g, ' ').trim();

    let item = {`;

code = code.replace(/let item = \{/, normalizeCode);
fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Added space normalization');
