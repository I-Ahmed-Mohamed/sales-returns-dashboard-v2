const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let hasBadName = false;
clients.forEach(c => c.items.forEach(i => {
    let n = i.newName || i.name;
    if (n.includes('( 18 ) بيضة') || n.includes('(18) بيضة')) {
        hasBadName = true;
        console.log('FOUND 18 EGG ITEM:', c.name, '->', n, '(Raw:', i.oldName, ')');
    }
}));
if (!hasBadName) console.log('NO 18 EGG ITEMS FOUND!');
