
const fs = require('fs');
const xlsx = require('C:/Users/SPEED/Desktop/scratch_excel/node_modules/xlsx');

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

let wbSales = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المبيعات.xlsx');
let salesRows = xlsx.utils.sheet_to_json(wbSales.Sheets['البيانات التفصيلية'], {header:1}).slice(1);

let wbReturns = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المرتجعات.xlsx');
let returnsRows = xlsx.utils.sheet_to_json(wbReturns.Sheets['البيانات التفصيلية'], {header:1}).slice(1);

let invoicesMap = {};

function processRow(row, isReturn) {
    if (!row || !row[2]) return;
    let invNo = String(row[2]).trim();
    if (!invoicesMap[invNo]) {
        invoicesMap[invNo] = {
            id: invNo,
            date: excelDateToJSDate(row[3]),
            isoDate: excelDateToISO(row[3]),
            timestamp: Number(row[3]) || 0,
            client: row[4] || 'عميل غير معروف',
            sales: [],
            returns: []
        };
    }
    
    let item = {
        newName: row[6] || '',
        oldName: row[7] || '',
        qty: Number(row[8]) || 0,
        price: Number(row[9]) || 0,
        discount: Number(row[10]) || 0,
        total: Number(row[11]) || 0
    };
    
    if (!item.newName && !item.oldName) {
        item.newName = row[7] || row[6] || 'صنف غير معروف';
    }
    
    item.name = item.newName || item.oldName;
    
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

