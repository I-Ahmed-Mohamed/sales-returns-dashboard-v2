const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let lulu = clients.find(c => c.name.includes('لولو'));
lulu.items.forEach(i => console.log(i.newName || i.name));
