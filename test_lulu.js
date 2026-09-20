const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let lulu = clients.find(c => c.name.includes('لولو'));
let targetItem = lulu.items.find(i => (i.newName || i.name).includes('فنادق'));
if(targetItem) {
    targetItem.transactions.slice(0, 5).forEach(t => console.log('Found! Price:', t.price, 'Qty:', t.qty, 'OldName:', t.oldName, 'NewName:', t.newName));
} else {
    console.log('Target item not found!');
}
