const fs = require('fs');

let base = fs.readFileSync('base_logic.js', 'utf8');
let html = fs.readFileSync('template.html', 'utf8');

let newLogic = `
// GROUP BY CLIENT
let clientsMap = {};
invoices.forEach(inv => {
    let cName = inv.client;
    if (!clientsMap[cName]) {
        clientsMap[cName] = {
            name: cName,
            items: {},
            totalGross: 0,
            totalNet: 0
        };
    }
    
    // Process Sales
    inv.sales.forEach(s => {
        if (!clientsMap[cName].items[s.name]) {
             clientsMap[cName].items[s.name] = { name: s.name, oldName: s.oldName, newName: s.newName, transactions: [] };
        }
        clientsMap[cName].items[s.name].transactions.push({
            type: 'بيع',
            date: inv.date,
            isoDate: inv.isoDate,
            timestamp: inv.timestamp,
            invId: inv.id,
            originalQty: s.originalQty,
            qty: s.qty,
            price: s.price,
            total: s.total,
            status: s.status
        });
    });
    
    // Process Returns
    inv.returns.forEach(r => {
        if (r.status === 'crossed_out') return;
        if (!clientsMap[cName].items[r.name]) {
             clientsMap[cName].items[r.name] = { name: r.name, oldName: r.oldName, newName: r.newName, transactions: [] };
        }
        clientsMap[cName].items[r.name].transactions.push({
            type: 'مرتجع (غير مرتبط)',
            date: inv.date,
            isoDate: inv.isoDate,
            timestamp: inv.timestamp,
            invId: inv.id,
            originalQty: 0,
            qty: -r.qty,
            price: r.price,
            total: -r.total,
            status: r.status
        });
    });
});

// Finalize clients array
let clients = Object.values(clientsMap).map(c => {
    let itemsArr = Object.values(c.items).map(itm => {
        itm.transactions.sort((a,b) => a.timestamp - b.timestamp);
        itm.totalQty = itm.transactions.reduce((sum, t) => sum + t.qty, 0);
        itm.totalAmt = itm.transactions.reduce((sum, t) => sum + t.total, 0);
        return itm;
    });
    c.items = itemsArr.sort((a,b) => a.name.localeCompare(b.name));
    
    c.totalGross = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.type==='بيع').reduce((s,t)=>s+(t.originalQty*t.price),0), 0);
    c.totalNet = c.items.reduce((sum, itm) => sum + itm.totalAmt, 0);
    c.totalReturns = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.qty < 0).reduce((s,t)=>s+Math.abs(t.total),0), 0);
    
    return c;
});

clients.sort((a,b) => a.name.localeCompare(b.name));

let htmlTemplate = \`\${require('fs').readFileSync('template.html', 'utf8')}\`;
htmlTemplate = htmlTemplate.replace('%INJECT_JSON%', encodeURIComponent(JSON.stringify(clients)));
require('fs').writeFileSync('index.html', htmlTemplate, 'utf8');
console.log('Successfully generated index.html!');
`;

fs.writeFileSync('build_dashboard.js', base + newLogic, 'utf8');
console.log('Done writing build_dashboard.js');
