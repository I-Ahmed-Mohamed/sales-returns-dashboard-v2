const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');
code = code.replace(/if \(isReturn\) \{ if \(clientName\.includes\('.*?'\) \|\| clientName\.includes\('.*?'\)\) return;/g, "if (isReturn) { if (row[4] && (row[4].includes('سوق') || row[4].includes('امازون'))) return;");
fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed');
