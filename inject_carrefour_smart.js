const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// I will just replace the inject_carrefour logic with a new one that forces سمارت for 10 and 15.
const newCarrefourLogic = `
    let isCarrefourClient = row[4] && (row[4].includes('ماف') || row[4].includes('كارفور'));
    let isCarrefourItem = oldName.includes('كارفور');
    
    if (isCarrefourClient || isCarrefourItem) {
        let t = 'ابيض';
        if(oldName.includes('بلد') || newName.includes('بلد')) t = 'بلدي';
        else if(oldName.includes('حمر') || newName.includes('حمر')) t = 'احمر';
        
        let qMatch = oldName.match(/\\d+/) || newName.match(/\\d+/);
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
`;

// Replace the old injected block
code = code.replace(/let isCarrefourClient = row\[4\] && \(row\[4\]\.includes\('ماف'\) \|\| row\[4\]\.includes\('كارفور'\)\);[\s\S]*?newName \+= ' كارفور';\s*}\s*}\s*}\s*}/, newCarrefourLogic.trim());

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Injected new Carrefour logic!');
