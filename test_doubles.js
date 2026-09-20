const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let doubles = new Set();
clients.forEach(c => c.items.forEach(i => {
    let name = i.newName || i.name;
    if(name.includes('  ')) doubles.add(name);
}));
console.log('Double spaced items:', doubles);
