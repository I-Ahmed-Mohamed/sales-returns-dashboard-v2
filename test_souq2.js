const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let souq = clients.find(c => c.name.includes('سوق'));
let targetItem = souq.items.find(i => (i.newName || i.name) === 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون');
targetItem.transactions.filter(t => t.price > 150).forEach(t => console.log('Raw Name:', t.name, 'Price:', t.price));
