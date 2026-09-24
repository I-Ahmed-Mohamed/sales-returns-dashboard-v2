const fs = require('fs');
let code = fs.readFileSync('make_v2_fix.js', 'utf8');

const crossInvoiceReconciliation = `
// --- CROSS-INVOICE RECONCILIATION ---
// For each client and item, match unlinked returns to sales with the same price!
Object.values(clientsMap).forEach(c => {
    Object.values(c.items).forEach(itm => {
        let returns = itm.transactions.filter(t => t.type.includes('OUSO U.OOO"O') && t.qty < 0);
        let sales = itm.transactions.filter(t => t.type.includes('O"USO1') && t.qty > 0);
        
        returns.forEach(r => {
            let qtyToDeduct = Math.abs(r.qty);
            sales.forEach(s => {
                if (Math.abs(s.price - r.price) < 0.1 && qtyToDeduct > 0 && s.qty > 0) {
                    let deduct = Math.min(s.qty, qtyToDeduct);
                    s.qty -= deduct;
                    s.total = s.qty * s.price;
                    
                    if (s.qty < s.originalQty) {
                        s.status = 'partially_returned';
                    }
                    if (s.qty === 0) {
                        s.status = 'fully_returned';
                    }
                    
                    qtyToDeduct -= deduct;
                }
            });
            
            if (qtyToDeduct === 0) {
                r.qty = 0;
                r.total = 0;
                r.status = 'crossed_out';
            } else {
                r.qty = -qtyToDeduct;
                r.total = -qtyToDeduct * r.price;
            }
        });
        
        // Filter out crossed out returns so they don't show in the UI!
        itm.transactions = itm.transactions.filter(t => t.status !== 'crossed_out');
    });
});
`;

code = code.replace(/\/\/ Finalize clients array/, crossInvoiceReconciliation + '\n// Finalize clients array');
fs.writeFileSync('make_v2_fix.js', code, 'utf8');
console.log('Injected global reconciliation!');
