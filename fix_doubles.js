const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

code = code.replace(/'بيض مائدة  بلدي اورجانيك \( 18 \) بيضة'/g, "'بيض مائدة بلدي اورجانيك ( 18 ) بيضة'");

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed double space in NAME_MAPPING');
