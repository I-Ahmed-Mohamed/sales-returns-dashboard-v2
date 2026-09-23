const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let maf = clients.find(c => c.name.includes('ماف'));
maf.items.forEach(i => console.log(i.newName || i.name));
