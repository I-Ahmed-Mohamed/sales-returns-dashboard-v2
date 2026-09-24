const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));

let c = clients.find(c => c.name === 'سوبر سنتر لتجارة وتوزيع المواد الغذائية');
console.log(c.items[0].transactions[0].type);
