const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// Update NAME_MAPPING
code = code.replace(/'بيض مائدة ابيض اورجانيك \( 18 \) بيضة'/g, "'بيض ابيض مغلف (18) قطعة'");

// Update global override
let overrideSearch = `if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }`;
let overrideReplace = `if (newName === 'بيض مائدة ابيض اورجانيك (30) شنطة بلاستيك') {
        newName = 'بيض ابيض مغلف (30) قطعة';
    }
    if (newName === 'بيض مائدة ابيض اورجانيك ( 18 ) بيضة' || newName === 'بيض مائدة ابيض اورجانيك (18) بيضة') {
        newName = 'بيض ابيض مغلف (18) قطعة';
    }`;
code = code.replace(overrideSearch, overrideReplace);

// Update programmatic fallback
let fallbackSearch = `if (type === 'ابيض' && qty === '30' && pkg === 'شنطة بلاستيك') {
                    newName = 'بيض ابيض مغلف (30) قطعة';
                } else {`;
let fallbackReplace = `if (type === 'ابيض' && qty === '30' && pkg === 'شنطة بلاستيك') {
                    newName = 'بيض ابيض مغلف (30) قطعة';
                } else if (type === 'ابيض' && qty === '18') {
                    newName = 'بيض ابيض مغلف (18) قطعة';
                } else {`;
code = code.replace(fallbackSearch, fallbackReplace);

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Done!');
