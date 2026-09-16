const fs = require('fs');
const xlsx = require('xlsx');

function excelDateToJSDate(serial) {
    if(!serial || isNaN(serial)) return serial;
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    return date_info.toLocaleDateString('ar-EG');
}

function excelDateToISO(serial) {
    if(!serial || isNaN(serial)) return '';
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    let y = date_info.getFullYear();
    let m = String(date_info.getMonth() + 1).padStart(2, '0');
    let d = String(date_info.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

let salesRows = [];
let returnsRows = [];

if (fs.existsSync('C:/Users/SPEED/Desktop/كارت المبيعات.xlsx')) {
    let wbSales = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المبيعات.xlsx');
    salesRows.push(...xlsx.utils.sheet_to_json(wbSales.Sheets['البيانات التفصيلية'], {header:1}).slice(1));
}
if (fs.existsSync('C:/Users/SPEED/Desktop/كارت المرتجعات.xlsx')) {
    let wbReturns = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المرتجعات.xlsx');
    returnsRows.push(...xlsx.utils.sheet_to_json(wbReturns.Sheets['البيانات التفصيلية'], {header:1}).slice(1));
}

// Add Month 5
if (fs.existsSync('كارت مبيعات 5.xlsx')) {
    let wbSales5 = xlsx.readFile('كارت مبيعات 5.xlsx');
    salesRows.push(...xlsx.utils.sheet_to_json(wbSales5.Sheets['البيانات التفصيلية'], {header:1}).slice(1));
}
if (fs.existsSync('كارت مرتجعات 5.xlsx')) {
    let wbReturns5 = xlsx.readFile('كارت مرتجعات 5.xlsx');
    returnsRows.push(...xlsx.utils.sheet_to_json(wbReturns5.Sheets['البيانات التفصيلية'], {header:1}).slice(1));
}

let invoicesMap = {};

const NAME_MAPPING = {
  'بيض ابيض مغلف 6 بيضة': 'بيض مائدة ابيض اورجانيك ( 6 ) بيضة',
  'بيض ابيض مغلف 15 بيضة': 'بيض مائدة ابيض اورجانيك ( 15 ) بيضة',
  'بيض احمر مغلف 10 بيضة': 'بيض مائدة احمر اورجانيك ( 10 ) بيضة',
  'بيض احمر مغلف 15 بيضة': 'بيض مائدة احمر اورجانيك ( 15 ) بيضة',
  'بيض احمر مغلف 30 بيضة': 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كرتون',
  'بيض بلدى مغلف 10 بيضة': 'بيض مائدة بلدي اورجانيك ( 10 ) بيضة',
  'بيض بلدى مغلف 18 بيضة': 'بيض مائدة  بلدي اورجانيك ( 18 ) بيضة',
  'بيض بلدى مغلف 30 بيضة': 'بيض مائدة بلدي اورجانيك ( 30 ) بيض-كرتون',
  'بيض بلدى مغلف 15 بيضة': 'بيض مائدة بلدي اورجانيك ( 15 ) بيضة',
  'بيض بلدى مغلف 6 بيضة': 'بيض مائدة بلدي اورجانيك ( 6 ) بيضة',
  'بيض ابيض مغلف 30 بيضة': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'بيض ابيض مغلف 20 بيضة': 'بيض مائدة ابيض اورجانيك ( 20 ) بيضة',
  'بيض ابيض مغلف 18 بيضة': 'بيض مائدة ابيض اورجانيك ( 18 ) بيضة',
  'بيض ابيض شنطة 30 بيضة': 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك',
  'بيض ابيض مغلف 10 بيضة': 'بيض مائدة ابيض اورجانيك ( 10 ) بيضة',
  'بيض احمر مغلف 18 بيضة': 'بيض مائدة احمر اورجانيك ( 18 ) بيضة',
  'بيض احمر مغلف 20 بيضة': 'بيض مائدة احمر اورجانيك ( 20 ) بيضة',
  'بيض احمر شنطة 30 بيضة': 'بيض مائدة احمر (30) شنطة بلاستيك',
  'بيض احمر مغلف 6 بيضة': 'بيض مائدة احمر اورجانيك ( 6 ) بيضة',
  'بيض بلدى شنطة 30 بيضة': 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك',
  'بيض بلدى مغلف 20 بيضة': 'بيض مائدة بلدي اورجانيك ( 20 ) بيضة',
  'بيض مائدة ابيض اورجانيك (30) بيضة-كارفور': 'بيض مائدة ابيض اورجانيك (30) بيضة-كارفور',
  'بيض مائدة احمر اورجانيك (30) بيضة-كارفور': 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كارفور',
  'بيض مائدة احمر (30)  شنطة بلاستيك': 'بيض مائدة احمر (30) شنطة بلاستيك',
  'بيض مائدة بلدى اورجانيك (18) بيضة': 'بيض مائدة  بلدي اورجانيك ( 18 ) بيضة',
  'بيض مائدة ابيض اورجانيك (20) بيضة': 'بيض مائدة ابيض اورجانيك ( 20 ) بيضة',
  'بيض مائدة ابيض اورجانيك (30) بيضة - كرتون': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'بيض مائدة ابيض اورجانك (6) بيضة': 'بيض مائدة ابيض اورجانيك ( 6 ) بيضة',
  'بيض مائدة بلدى اورجانيك (20) بيضة': 'بيض مائدة بلدي اورجانيك ( 20 ) بيضة',
  'بيض مائدة احمر اورجانيك (10)  بيضة': 'بيض مائدة احمر اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (6) بيضة': 'بيض مائدة بلدي اورجانيك ( 6 ) بيضة',
  'بيض مائدة احمر اورجانيك (15)  بيضة': 'بيض مائدة احمر اورجانيك ( 15 ) بيضة',
  'بيض ابيض مغلف 18 قطعة': 'بيض مائدة ابيض اورجانيك ( 18 ) بيضة',
  'بيض ابيض مغلف 30 قطعة': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'يض مائدة احمر اورجانيك (6)  بيضة': 'بيض مائدة احمر اورجانيك ( 6 ) بيضة',
  'بيض مائدة احمر اورجانيك (20)  بيضة': 'بيض مائدة احمر اورجانيك ( 20 ) بيضة',
  'بيض مائدة احمر اورجانيك (18)  بيضة': 'بيض مائدة احمر اورجانيك ( 18 ) بيضة',
  'بيض مائدة ابيض اورجانيك (15) بيضة': 'بيض مائدة ابيض اورجانيك ( 15 ) بيضة',
  'بيض مائدة بلدى اورجانيك (30) بلاستيك': 'بيض مائدة بلدي اورجانيك ( 30 ) بيض-كرتون',
  'بيض مائدة بلدى اورجانيك (15) بيضة': 'بيض مائدة بلدي اورجانيك ( 15 ) بيضة',
  'بيض مائدة ابيض اورجانك (10) بيضة': 'بيض مائدة ابيض اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (10) بيضة': 'بيض مائدة بلدي اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (30) بيضة - كرتون': 'بيض مائدة بلدي اورجانيك ( 30 ) بيض-كرتون',
  'بيض مائدة احمر اورجانيك (30)  بيضة - كرتون': 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كرتون',
  'بيض ابيض فنادق 30 بيضة': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'بيض مائدة ابيض اورجانيك ( 10 ) بيضة كارفور': 'بيض مائدة ابيض اورجانيك ( 10 ) بيضة كارفور',
  'بيض مائدة ابيض اورجانيك ( 15 ) بيضة كارفور': 'بيض مائدة ابيض اورجانيك ( 15 ) بيضة كارفور',
  'بيض مائدة احمر اورجانيك ( 10 ) بيضة كارفور': 'بيض مائدة احمر اورجانيك ( 10 ) بيضة كارفور',
  'بيض مائدة احمر اورجانيك ( 15 ) بيضة كارفور': 'بيض مائدة احمر اورجانيك ( 15 ) بيضة كارفور',
  'بيض  ابيض فنادق 30 بيضة': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  // Some standard fallbacks for any missing ones
  'بيض ابيض مغلف  30 قطعة ': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون'
};

function processRow(row, isReturn) {
    if (!row || !row[2]) return;
    let invNo = String(row[2]).trim();
    if (!invoicesMap[invNo]) {
        invoicesMap[invNo] = {
            id: invNo,
            date: excelDateToJSDate(row[3]),
            isoDate: excelDateToISO(row[3]),
            timestamp: Number(row[3]) || 0,
            client: row[4] || 'غير معروف',
            sales: [],
            returns: []
        };
    }
    
    // The user explicitly wants the RAW system name (Column H which is index 7)
    // Sometimes they put data in Column G (index 6) in month 4, but H is the real system name.
    let systemName = (row[7] || '').toString().trim();
    if (!systemName) {
        systemName = (row[6] || '').toString().trim(); // fallback just in case
    }
    
    let item = {
        newName: systemName, 
        oldName: systemName,
        name: systemName || 'صنف غير معروف',
        qty: Number(row[8]) || 0,
        price: Number(row[9]) || 0,
        discount: Number(row[10]) || 0,
        total: Number(row[11]) || 0
    };
    
    if (isReturn) {
        invoicesMap[invNo].returns.push(item);
    } else {
        invoicesMap[invNo].sales.push(item);
    }
}

salesRows.forEach(r => processRow(r, false));
returnsRows.forEach(r => processRow(r, true));

// RECONCILE RETURNS WITH SALES
let invoices = Object.values(invoicesMap).sort((a,b) => b.timestamp - a.timestamp);

invoices.forEach(inv => {
    let grossBeforeAnyDiscount = 0;
    let totalDiscountBeforeReturn = 0;
    let originalInvoiceTotal = 0; 
    let totalReturnAmount = 0;
    let netInvoiceTotal = 0; 
    
    let reconciledSales = inv.sales.map(s => ({ ...s, originalQty: s.qty, originalTotal: s.total, originalDiscount: s.discount, deductedQty: 0 }));
    let reconciledReturns = inv.returns.map(r => ({ ...r, deductedQty: 0 }));

    // Match returns to sales
    reconciledReturns.forEach(r => {
        let qtyToDeduct = r.qty;
        reconciledSales.forEach(s => {
            if (s.name === r.name && qtyToDeduct > 0 && s.qty > 0) {
                let deduct = Math.min(s.qty, qtyToDeduct);
                s.qty -= deduct;
                s.deductedQty += deduct;
                
                r.deductedQty += deduct;
                qtyToDeduct -= deduct;
            }
        });
    });

    // Finalize Sales
    reconciledSales.forEach(s => {
        grossBeforeAnyDiscount += (s.originalQty * s.price);
        totalDiscountBeforeReturn += s.originalDiscount;
        originalInvoiceTotal += s.originalTotal;
        
        let proportion = s.originalQty > 0 ? (s.qty / s.originalQty) : 0;
        s.discount = s.originalDiscount * proportion;
        s.total = s.originalTotal * proportion;
        s.status = s.deductedQty > 0 ? 'partially_returned' : 'active';
        
        netInvoiceTotal += s.total;
    });
    
    // Finalize Returns (split if partially matched)
    let finalReturns = [];
    reconciledReturns.forEach(r => {
        totalReturnAmount += r.total;
        if (r.deductedQty > 0) {
            let prop = r.deductedQty / r.qty;
            finalReturns.push({
                ...r,
                qty: r.deductedQty,
                total: r.total * prop,
                status: 'crossed_out'
            });
        }
        let remaining = r.qty - r.deductedQty;
        if (remaining > 0) {
            let prop = remaining / r.qty;
            finalReturns.push({
                ...r,
                qty: remaining,
                total: r.total * prop,
                status: 'active'
            });
        }
    });
    
    inv.sales = reconciledSales;
    inv.returns = finalReturns;
    inv.grossBeforeAnyDiscount = grossBeforeAnyDiscount;
    inv.totalDiscountBeforeReturn = totalDiscountBeforeReturn;
    inv.originalInvoiceTotal = originalInvoiceTotal;
    inv.totalReturnAmount = totalReturnAmount;
    inv.netInvoiceTotal = netInvoiceTotal;
});


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
    c.items = itemsArr.sort((a,b) => {
        let numA = parseInt((a.name.match(/\d+/) || [0])[0]);
        let numB = parseInt((b.name.match(/\d+/) || [0])[0]);
        if (numA !== numB) {
            return numA - numB;
        }
        return a.name.localeCompare(b.name);
    });
    
    c.totalGross = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.type==='بيع').reduce((s,t)=>s+(t.originalQty*t.price),0), 0);
    c.totalNet = c.items.reduce((sum, itm) => sum + itm.totalAmt, 0);
    c.totalReturns = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.qty < 0).reduce((s,t)=>s+Math.abs(t.total),0), 0);
    c.totalPieces = c.items.reduce((sum, itm) => sum + itm.totalQty, 0);

    
    return c;
});

clients.sort((a,b) => a.name.localeCompare(b.name));

let htmlTemplate = `${require('fs').readFileSync('template.html', 'utf8')}`;
htmlTemplate = htmlTemplate.replace('%INJECT_JSON%', encodeURIComponent(JSON.stringify(clients)));
require('fs').writeFileSync('index.html', htmlTemplate, 'utf8');
console.log('Successfully generated index.html!');
