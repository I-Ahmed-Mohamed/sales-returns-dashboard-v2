const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');
code = code.replace(/'بيض ابيض مغلف 30 قطعة': 'بيض مائدة ابيض اورجانيك \(30\) بيضة-كرتون',/g, "'بيض ابيض مغلف 30 قطعة': 'بيض ابيض مغلف (30) قطعة',");
fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed mapping for بيض ابيض مغلف 30 قطعة');
