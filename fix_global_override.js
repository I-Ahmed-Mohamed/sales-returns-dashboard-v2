const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// The string to insert
const overrideCode = `
    // Global override to catch pre-existing incorrect names from Excel column 6
    if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (oldName.includes('بيض ابيض مغلف 30 قطعة')) {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
`;

code = code.replace(/\/\/ Global override to catch pre-existing incorrect names from Excel column 6\s*if \(newName === 'بيض مائدة ابيض اورجانيك \(30\) شنطة بلاستيك'\) \{\s*newName = 'بيض ابيض مغلف \(30\) قطعة';\s*\}/, overrideCode);

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed!');
