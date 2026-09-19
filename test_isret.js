const fs = require('fs');
const xlsx = require('xlsx');

['شهر 4/كارت المبيعات 4.xlsx', 'شهر 5/كارت مبيعات 5.xlsx'].forEach(f => {
    let wb = xlsx.readFile(f);
    let rows = xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1);
    rows.forEach((row, idx) => {
        let invoiceType = (row[1] || '').toString();
        let isReturn = invoiceType.includes('مرتجع') || String(row[11]) < 0;
        if (isReturn) {
            console.log('Line:', idx, 'Type:', invoiceType, 'Row11:', row[11], 'Client:', row[4]);
        }
    });
});
