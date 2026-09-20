const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// Update NAME_MAPPING for Red Bags to remove "فنادق"
code = code.replace(/'بيض احمر شنطة 30 بيضة': 'بيض مائدة احمر \(30\) شنطة بلاستيك فنادق',/g, "'بيض احمر شنطة 30 بيضة': 'بيض مائدة احمر (30) شنطة بلاستيك',");
code = code.replace(/'بيض مائدة احمر \(30\)  شنطة بلاستيك': 'بيض مائدة احمر \(30\) شنطة بلاستيك فنادق',/g, "'بيض مائدة احمر (30)  شنطة بلاستيك': 'بيض مائدة احمر (30) شنطة بلاستيك',");

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed red bag mapping in NAME_MAPPING!');
