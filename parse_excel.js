const XLSX = require('xlsx');
const fs = require('fs');

function parseExcel(file) {
    let workbook = XLSX.readFile(file);
    let sheetName = workbook.SheetNames[0];
    let sheet = workbook.Sheets[sheetName];
    // Convert to 2D array of values
    let rawJson = XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false, defval: null});
    
    // In our base_logic.js, we expect an array of objects like:
    // { "col_1": "date", "col_2": "invId", "col_3": "type", ... "col_5": "client", "col_6": "newName", "col_7": "oldName", "col_9": "originalQty", "col_10": "netQty", "col_11": "price", "col_12": "total" }
    
    // We can map the 2D array rows to this format.
    // Wait, let's see how they were formatted before.
    let formatted = rawJson.map((row) => {
        let obj = {};
        row.forEach((val, index) => {
            obj[`col_${index + 1}`] = val;
        });
        return obj;
    });
    
    return formatted;
}

try {
    let sales = parseExcel('كارت مبيعات 5.xlsx');
    fs.writeFileSync('sales5.json', JSON.stringify(sales, null, 2));
    console.log('Parsed sales');
} catch(e) { console.error('Error parsing sales', e); }

try {
    let returns = parseExcel('كارت مرتجعات 5.xlsx');
    fs.writeFileSync('returns5.json', JSON.stringify(returns, null, 2));
    console.log('Parsed returns');
} catch(e) { console.error('Error parsing returns', e); }
