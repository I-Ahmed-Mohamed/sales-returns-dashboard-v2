const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let souq = clients.find(c => c.name.includes('سوق'));
souq.items.forEach(i => {
    let returns = i.transactions.filter(t => t.type.includes('مرتجع'));
    if(returns.length > 0) {
        console.log(i.newName || i.name, 'Returns:', returns.length);
        returns.slice(0, 3).forEach(r => console.log('   Date:', r.date, 'Qty:', r.qty, 'Raw Name:', r.oldName || 'unknown'));
    }
});
