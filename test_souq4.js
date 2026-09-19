const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let souq = clients.find(c => c.name.includes('سوق'));
let targetItem = souq.items.find(i => (i.newName || i.name) === 'بيض ابيض مغلف (30) قطعة');
if(targetItem) {
    targetItem.transactions.slice(0, 5).forEach(t => console.log('Found in target item! Price:', t.price, 'Qty:', t.qty));
} else {
    console.log('Target item not found!');
}
