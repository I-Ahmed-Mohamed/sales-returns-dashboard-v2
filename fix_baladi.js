const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// Update NAME_MAPPING
code = code.replace(
    /'بيض مائدة بلدى اورجانيك \(30\) بلاستيك': 'بيض مائدة بلدي اورجانيك \( 30 \) بيض-كرتون',/g, 
    "'بيض مائدة بلدى اورجانيك (30) بلاستيك': 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك',"
);

// Add global override
const overrideCode = `    if (oldName.includes('بيض مائدة بلدى اورجانيك (30) بلاستيك') || oldName.includes('بيض مائدة بلدي اورجانيك (30) بلاستيك')) {
        newName = 'بيض مائدة بلدي اورجانيك ( 30 ) شنطة بلاستيك';
    }
`;

code = code.replace(
    /if \(oldName\.includes\('بيض ابيض مغلف 30 قطعة'\)\) \{\s*newName = 'بيض ابيض مغلف \(30\) قطعة';\s*\}/g,
    "if (oldName.includes('بيض ابيض مغلف 30 قطعة')) {\n        newName = 'بيض ابيض مغلف (30) قطعة';\n    }\n" + overrideCode
);

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed Baladi bag mapping');
