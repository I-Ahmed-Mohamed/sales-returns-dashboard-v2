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

if (fs.existsSync('شهر 4/كارت المبيعات 4.xlsx')) { let wb = xlsx.readFile('شهر 4/كارت المبيعات 4.xlsx'); salesRows.push(...xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1)); }
if (fs.existsSync('شهر 4/كارت المرتجعات 4.xlsx')) { let wb = xlsx.readFile('شهر 4/كارت المرتجعات 4.xlsx'); returnsRows.push(...xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1)); }

if (fs.existsSync('شهر 5/كارت مبيعات 5.xlsx')) { let wb = xlsx.readFile('شهر 5/كارت مبيعات 5.xlsx'); salesRows.push(...xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1)); }
if (fs.existsSync('شهر 5/كارت مرتجعات 5.xlsx')) { let wb = xlsx.readFile('شهر 5/كارت مرتجعات 5.xlsx'); returnsRows.push(...xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1)); }

let invoicesMap = {};

const NAME_MAPPING = {
  'بيض ابيض مغلف 6 بيضة': 'بيض مائدة ابيض اورجانيك ( 6 ) بيضة',
  'بيض ابيض مغلف 15 بيضة': 'بيض مائدة ابيض اورجانيك ( 15 ) بيضة',
  'بيض احمر مغلف 10 بيضة': 'بيض مائدة احمر اورجانيك ( 10 ) بيضة',
  'بيض احمر مغلف 15 بيضة': 'بيض مائدة احمر اورجانيك ( 15 ) بيضة',
  'بيض احمر مغلف 30 بيضة': 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كرتون',
  'بيض بلدى مغلف 10 بيضة': 'بيض مائدة بلدي اورجانيك ( 10 ) بيضة',
  'بيض بلدى مغلف 18 بيضة': 'بيض مائدة بلدي اورجانيك ( 18 ) بيضة',
  'بيض بلدى مغلف 30 بيضة': 'بيض مائدة بلدي اورجانيك ( 30 ) بيض-كرتون',
  'بيض بلدى مغلف 15 بيضة': 'بيض مائدة بلدي اورجانيك ( 15 ) بيضة',
  'بيض بلدى مغلف 6 بيضة': 'بيض مائدة بلدي اورجانيك ( 6 ) بيضة',
  'بيض ابيض مغلف 30 بيضة': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'بيض ابيض مغلف 20 بيضة': 'بيض مائدة ابيض اورجانيك ( 20 ) بيضة',
  'بيض ابيض مغلف 18 بيضة': 'بيض ابيض مغلف (18) قطعة',
  'بيض ابيض شنطة 30 بيضة': 'بيض ابيض مغلف (30) قطعة',
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
  'بيض مائدة بلدى اورجانيك (18) بيضة': 'بيض مائدة بلدي اورجانيك ( 18 ) بيضة',
  'بيض مائدة ابيض اورجانيك (20) بيضة': 'بيض مائدة ابيض اورجانيك ( 20 ) بيضة',
  'بيض مائدة ابيض اورجانيك (30) بيضة - كرتون': 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون',
  'بيض مائدة ابيض اورجانك (6) بيضة': 'بيض مائدة ابيض اورجانيك ( 6 ) بيضة',
  'بيض مائدة بلدى اورجانيك (20) بيضة': 'بيض مائدة بلدي اورجانيك ( 20 ) بيضة',
  'بيض مائدة احمر اورجانيك (10)  بيضة': 'بيض مائدة احمر اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (6) بيضة': 'بيض مائدة بلدي اورجانيك ( 6 ) بيضة',
  'بيض مائدة احمر اورجانيك (15)  بيضة': 'بيض مائدة احمر اورجانيك ( 15 ) بيضة',
  'بيض ابيض مغلف 18 قطعة': 'بيض ابيض مغلف (18) قطعة',
  'بيض ابيض مغلف 30 قطعة': 'بيض ابيض مغلف (30) قطعة',
  'يض مائدة احمر اورجانيك (6)  بيضة': 'بيض مائدة احمر اورجانيك ( 6 ) بيضة',
  'بيض مائدة احمر اورجانيك (20)  بيضة': 'بيض مائدة احمر اورجانيك ( 20 ) بيضة',
  'بيض مائدة احمر اورجانيك (18)  بيضة': 'بيض مائدة احمر اورجانيك ( 18 ) بيضة',
  'بيض مائدة ابيض اورجانيك (15) بيضة': 'بيض مائدة ابيض اورجانيك ( 15 ) بيضة',
  'بيض مائدة بلدى اورجانيك (30) بلاستيك': 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك',
  'بيض مائدة بلدى اورجانيك (15) بيضة': 'بيض مائدة بلدي اورجانيك ( 15 ) بيضة',
  'بيض مائدة ابيض اورجانك (10) بيضة': 'بيض مائدة ابيض اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (10) بيضة': 'بيض مائدة بلدي اورجانيك ( 10 ) بيضة',
  'بيض مائدة بلدى اورجانيك (30) بيضة - كرتون': 'بيض مائدة بلدي اورجانيك ( 30 ) بيض-كرتون',
  'بيض مائدة احمر اورجانيك (30)  بيضة - كرتون': 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كرتون',
  'بيض ابيض فنادق 30 بيضة': 'بيض مائدة ابيض (30) قطعة بلاستيك فنادق',
  'بيض  ابيض فنادق 30 بيضة': 'بيض مائدة ابيض (30) قطعة بلاستيك فنادق',
  'بيض مائدة ابيض  (30) قطعة  بلاستيك فنادق': 'بيض مائدة ابيض (30) قطعة بلاستيك فنادق'
};

function processRow(row, isReturn) {
    if (!row || !row[2]) return;
    let invNo = String(row[2]).trim();
    if (!invoicesMap[invNo]) {
        
        let clientName = row[4] || 'غير معروف';
        
        // --- Client Name Normalization ---
        if (clientName.includes('سوبر سنتر')) {
            clientName = 'سوبر سنتر لتجارة وتوزيع المواد الغذائية';
        } else if (clientName.includes('ماف') || clientName.includes('كارفور')) {
            clientName = 'ماف للهايبر ماركتس (كارفور)';
        } else if (clientName.includes('اللولو')) {
            clientName = 'اللولو للأسواق التجارية (لولو)';
        } else if (clientName.includes('اوسكار')) {
            clientName = 'أوسكار جراند ستورز (Oscar)';
        } else if (clientName.includes('بنده') || clientName.includes('بندة')) {
            clientName = 'بنده العالمية (Panda)';
        } else if (clientName.includes('كازيون')) {
            clientName = 'كازيون ماركت (Kazyon)';
        } else if (clientName.includes('سوق دوت كوم')) {
            clientName = 'سوق دوت كوم (أمازون)';
        } else if (clientName.includes('سبينيس')) {
            clientName = 'سبينيس ايجيبت (Spinneys)';
        } else if (clientName.includes('الفار')) {
            clientName = 'شركة الفار التجارية';
        } else if (clientName.includes('الديار')) {
            clientName = 'الديار القطرية للاستثمار';
        } else if (clientName.includes('ماريوت')) {
            clientName = 'فندق ماريوت مينا هاوس';
        } else if (clientName.includes('اولاد رجب')) {
            clientName = 'أولاد رجب (Awlad Ragab)';
        } else if (clientName.includes('آفاق')) {
            clientName = 'آفاق للاستثمار السياحي';
        } else if (clientName.includes('رابيا')) {
            clientName = 'نيو رابيا للتجارة والتوزيع';
        } else if (clientName.includes('جودز مارت')) {
            clientName = 'جودز مارت (GoodsMart)';
        } else if (clientName.includes('زهران')) {
            clientName = 'زهران ماركت';
        }
        
        invoicesMap[invNo] = {
            id: invNo,
            date: excelDateToJSDate(row[3]),
            isoDate: excelDateToISO(row[3]),
            timestamp: Number(row[3]) || 0,
            client: clientName,
            sales: [],
            returns: []
        };
    }
    
    let oldName = (row[7] || '').toString().trim();
    let rawNewName = (row[6] || '').toString().trim();
    
    let newName = rawNewName;

    // FORCE OVERRIDE for hotels!
    let isHotelClient = row[4] && (row[4].includes('سياح') || row[4].includes('فندق') || row[4].includes('آفاق') || row[4].includes('الديار') || row[4].includes('ماريوت'));
    
    if (oldName.includes('فنادق') || (isHotelClient && oldName.includes('30'))) {
        if (oldName.includes('احمر') || oldName.includes('أحمر')) {
            newName = 'بيض مائدة احمر (30) شنطة بلاستيك فنادق';
        } else if (oldName.includes('بلد')) {
            newName = 'بيض مائدة بلدي اورجانيك ( 30 ) بلاستيك فنادق';
        } else {
            newName = 'بيض مائدة ابيض (30) قطعة بلاستيك فنادق';
        }
    }

    if (!newName && oldName) {
        if (NAME_MAPPING[oldName]) {
            newName = NAME_MAPPING[oldName];
        } else {
            // Programmatic fallback
            let type = 'ابيض';
            if(oldName.includes('بلد')) type = 'بلدي';
            else if(oldName.includes('حمر')) type = 'احمر';
            
            let qtyMatch = oldName.match(/\d+/);
            let qty = qtyMatch ? qtyMatch[0] : '';
            
            let pkg = 'بيضة';
            if(qty === '30') {
                if(oldName.includes('شنط')) pkg = 'شنطة بلاستيك';
                else pkg = 'بيضة-كرتون';
            }
            
            if (qty) {
                if (type === 'ابيض' && qty === '30' && pkg === 'شنطة بلاستيك') {
                    newName = 'بيض ابيض مغلف (30) قطعة';
                } else if (type === 'ابيض' && qty === '18') {
                    newName = 'بيض ابيض مغلف (18) قطعة';
                } else {
                    newName = 'بيض مائدة ' + type + ' اورجانيك ' + (qty==='30' ? '('+qty+') ' : '( '+qty+' ) ') + pkg;
                }
            } else {
                newName = oldName;
            }
        }
    }
    
    
    // Global override to catch pre-existing incorrect names from Excel column 6
    if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (oldName.includes('بيض ابيض مغلف 30 قطعة')) {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (oldName.includes('بيض مائدة بلدى اورجانيك (30) بلاستيك') || oldName.includes('بيض مائدة بلدي اورجانيك (30) بلاستيك')) {
        newName = 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك';
    }


    if (newName === 'بيض مائدة ابيض اورجانيك ( 18 ) بيضة' || newName === 'بيض مائدة ابيض اورجانيك (18) بيضة') {
        newName = 'بيض ابيض مغلف (18) قطعة';
    }
    
    
    // Normalize all extra spaces
    
    let isCarrefourClient = row[4] && (row[4].includes('ماف') || row[4].includes('كارفور'));
    let isCarrefourItem = oldName.includes('كارفور');
    
    if (isCarrefourClient || isCarrefourItem) {
        let t = 'ابيض';
        if(oldName.includes('بلد') || newName.includes('بلد')) t = 'بلدي';
        else if(oldName.includes('حمر') || newName.includes('حمر')) t = 'احمر';
        
        let qMatch = oldName.match(/\d+/) || newName.match(/\d+/);
        let q = qMatch ? qMatch[0] : '';
        
        if (q === '10' || q === '15') {
            // Force Smart for 10 and 15 for Carrefour
            newName = 'بيض مائدة ' + t + ' سمارت ( ' + q + ' ) قطعة كارفور';
        } else if (oldName.includes('سمارت')) {
             if (q) {
                 newName = 'بيض مائدة ' + t + ' سمارت ' + (q==='30' ? '('+q+')' : '( '+q+' )') + ' قطعة كارفور';
             }
        } else {
            if (!newName.includes('كارفور')) {
                newName = newName.replace('-كرتون', '').trim();
                if (q === '30') {
                    if (newName.includes('احمر')) {
                        newName = 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كارفور';
                    } else if (newName.includes('ابيض')) {
                        newName = 'بيض مائدة ابيض اورجانيك (30) بيضة-كارفور';
                    }
                } else {
                    if (!newName.includes('بيضة') && !newName.includes('قطعة')) newName += ' بيضة';
                    newName += ' كارفور';
                }
            }
        }
    }

    if (newName) newName = newName.replace(/\s+/g, ' ').trim();
    if (oldName) oldName = oldName.replace(/\s+/g, ' ').trim();

    let item = {
        newName: newName,
        oldName: oldName,
        name: newName || oldName || 'صنف غير معروف',
        qty: Number(row[8]) || 0,
        price: Number(row[9]) || 0,
        discount: Number(row[10]) || 0,
        total: Number(row[11]) || 0
    };
    
    if (isReturn) { if (row[4] && (row[4].includes('سوق') || row[4].includes('امازون'))) return;
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


// --- CROSS-INVOICE RECONCILIATION ---
// For each client and item, match unlinked returns to sales with the same price!
Object.values(clientsMap).forEach(c => {
    Object.values(c.items).forEach(itm => {
        let returns = itm.transactions.filter(t => t.type.includes('مرتجع') && t.qty < 0);
        let sales = itm.transactions.filter(t => t.type.includes('بيع') && t.qty > 0);
        
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
