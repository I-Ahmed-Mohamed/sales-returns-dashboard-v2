const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let totalReturns = 0;
clients.forEach(c => c.items.forEach(i => i.transactions.forEach(t => {
    if(t.type.includes('مرتجع')) totalReturns++;
})));
console.log('Total Returns in Dashboard:', totalReturns);
