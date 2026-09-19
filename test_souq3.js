const fs = require('fs');
const xlsx = require('xlsx');

// Mock NAME_MAPPING from base_logic.js
const code = fs.readFileSync('base_logic.js', 'utf8');
const match = code.match(/NAME_MAPPING\s*=\s*({[\s\S]*?})/);
const NAME_MAPPING = new Function('return ' + match[1])();

['شهر 4/كارت المبيعات 4.xlsx', 'شهر 5/كارت مبيعات 5.xlsx'].forEach(f => {
    let wb = xlsx.readFile(f);
    let rows = xlsx.utils.sheet_to_json(wb.Sheets['البيانات التفصيلية'], {header:1}).slice(1);
    rows.forEach(row => {
        if (!row[4] || !row[4].includes('سوق')) return;
        if (Number(row[9]) !== 160.14) return;
        
        let oldName = (row[7] || '').toString().trim();
        let rawNewName = (row[6] || '').toString().trim();
        let newName = rawNewName;

        let isHotelClient = false;
        
        if (!newName && oldName) {
            if (NAME_MAPPING[oldName]) {
                newName = NAME_MAPPING[oldName];
            } else {
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
                        newName = 'بيض مائدة ' + type + ' اورجانيك ( ' + (qty==='30'?qty:(' '+qty+' ')) + ' ) ' + pkg;
                    }
                } else {
                    newName = oldName;
                }
            }
        }
        
        if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
            newName = 'بيض ابيض مغلف (30) قطعة';
        }
        
        if (newName === 'بيض مائدة ابيض اورجانيك (30) بيضة-كرتون') {
            console.log('BUG! Raw:', oldName, 'RawNewName:', rawNewName);
        }
    });
});
