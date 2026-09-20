const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

// Replace the old generation logic:
// newName = 'بيض مائدة ' + type + ' اورجانيك ( ' + (qty==='30'?qty:(' '+qty+' ')) + ' ) ' + pkg;
// with:
// newName = 'بيض مائدة ' + type + ' اورجانيك ' + (qty==='30' ? '('+qty+') ' : '( '+qty+' ) ') + pkg;

code = code.replace(/newName = 'بيض مائدة ' \+ type \+ ' اورجانيك \( ' \+ \(qty==='30'\?qty:\(' '\+qty\+' '\)\) \+ ' \) ' \+ pkg;/g, 
    "newName = 'بيض مائدة ' + type + ' اورجانيك ' + (qty==='30' ? '('+qty+') ' : '( '+qty+' ) ') + pkg;");

fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Fixed space format');
