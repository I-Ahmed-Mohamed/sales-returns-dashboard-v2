const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let maf = clients.find(c => c.name.includes('ماف'));
if (maf) {
    let org = maf.items.find(i => (i.newName||i.name).includes('اورجانيك') && (i.newName||i.name).includes('10'));
    let smart = maf.items.find(i => (i.newName||i.name).includes('سمارت') && (i.newName||i.name).includes('10'));
    if (org) console.log('Organic Price:', org.transactions[0].price);
    if (smart) console.log('Smart Price:', smart.transactions[0].price);
}
