const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

const carrefourLogic = `
    let isCarrefourClient = row[4] && (row[4].includes('ماف') || row[4].includes('كارفور'));
    let isCarrefourItem = oldName.includes('كارفور');
    
    if (isCarrefourClient || isCarrefourItem) {
        if (oldName.includes('سمارت')) {
             let t = 'ابيض';
             if(oldName.includes('بلد')) t = 'بلدي';
             else if(oldName.includes('حمر')) t = 'احمر';
             let qMatch = oldName.match(/\\d+/);
             let q = qMatch ? qMatch[0] : '';
             if (q) {
                 newName = 'بيض مائدة ' + t + ' سمارت ' + (q==='30' ? '('+q+')' : '( '+q+' )') + ' قطعة كارفور';
             }
        } else {
            if (!newName.includes('كارفور')) {
                newName = newName.replace('-كرتون', '').trim();
                let qMatch = newName.match(/\\d+/);
                let q = qMatch ? qMatch[0] : '';
                if (q === '30') {
                    if (newName.includes('احمر')) {
                        newName = 'بيض مائدة احمر اورجانيك ( 30 ) بيضة-كارفور';
                    } else if (newName.includes('ابيض')) {
                        newName = 'بيض مائدة ابيض اورجانيك (30) بيضة-كارفور';
                    }
                } else {
                    if (!newName.includes('بيضة')) newName += ' بيضة';
                    newName += ' كارفور';
                }
            }
        }
    }
`;

const anchor = "if (newName) newName = newName.replace(/\\s+/g, ' ').trim();";
if (code.includes(anchor)) {
    code = code.replace(anchor, carrefourLogic + "\n    " + anchor);
    fs.writeFileSync('base_logic.js', code, 'utf8');
    console.log('Injected successfully!');
} else {
    console.log('Anchor not found!');
}
