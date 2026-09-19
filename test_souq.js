const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let souq = clients.find(c => c.name.includes('سوق'));
let targetItem = souq.items.find(i => (i.newName || i.name) === 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون');
targetItem.transactions.slice(0, 20).forEach(t => console.log('Date:', t.date, 'Qty:', t.qty, 'Price:', t.price, 'Original Total:', t.originalTotal));
