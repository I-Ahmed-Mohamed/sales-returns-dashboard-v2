const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let hasBadName = false;
clients.forEach(c => c.items.forEach(i => {
    let n = i.newName || i.name;
    if (n === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        hasBadName = true;
        console.log('BAD NAME IN LOCAL INDEX.HTML FOR CLIENT:', c.name, 'RAW:', i.oldName);
    }
}));
if (!hasBadName) console.log('NO BAD NAME FOUND!');
