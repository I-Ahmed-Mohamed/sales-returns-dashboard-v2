const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let maf = clients.find(c => c.name.includes('ماف'));
let org = maf.items.find(i => (i.newName||i.name) === 'بيض مائدة ابيض اورجانيك ( 10 ) بيضة كارفور');
org.transactions.forEach(t => console.log('Price:', t.price, 'Qty:', t.qty));
