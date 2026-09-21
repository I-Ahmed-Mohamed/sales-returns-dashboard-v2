const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(process.env.USERPROFILE, 'Desktop', 'كارت مبيعات 5.6-4.xlsx');
let wb = xlsx.readFile(filePath, {cellStyles: true});
let sheet = wb.Sheets['البيانات التفصيلية'];

let code = fs.readFileSync('base_logic.js', 'utf8');
let match = code.match(/NAME_MAPPING\s*=\s*({[\s\S]*?})/);
const NAME_MAPPING = new Function('return ' + match[1])();

let range = xlsx.utils.decode_range(sheet['!ref']);

for(let R = range.s.r + 1; R <= range.e.r; ++R) {
    let oldNameCell = sheet[xlsx.utils.encode_cell({c: 6, r: R})];
    if (!oldNameCell || !oldNameCell.v) continue;
    
    let oldName = (oldNameCell.v || '').toString().trim();
    let newName = '';
    
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
                newName = 'بيض مائدة ' + type + ' اورجانيك ' + (qty==='30' ? '('+qty+') ' : '( '+qty+' ) ') + pkg;
            }
        } else {
            newName = oldName;
        }
    }
    
    if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (oldName.includes('بيض ابيض مغلف 30 قطعة')) {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (oldName.includes('بيض مائدة بلدى اورجانيك (30) بلاستيك') || oldName.includes('بيض مائدة بلدي اورجانيك (30) بلاستيك')) {
        newName = 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك';
    }
    
    newName = (newName || '').replace(/\s+/g, ' ').trim();
    
    let targetCellRef = xlsx.utils.encode_cell({c: 5, r: R});
    sheet[targetCellRef] = {t: 's', v: newName};
}

const outPath = path.join(process.env.USERPROFILE, 'Desktop', 'كارت مبيعات 5.6-4_معدل.xlsx');
xlsx.writeFile(wb, outPath);
console.log('Saved to', outPath);
