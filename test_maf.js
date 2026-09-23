const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let maf = clients.find(c => c.name.includes('ماف'));
let badItems = maf.items.filter(i => !(i.newName||i.name).includes('كارفور'));
badItems.forEach(i => {
    console.log('BAD ITEM:', i.newName || i.name);
    // Since we don't save oldName on the output JSON by default, let's just log the price to guess
    console.log('Price:', i.transactions[0].price);
});
