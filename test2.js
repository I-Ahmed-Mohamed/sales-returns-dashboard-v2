const fs = require('fs');
const code = fs.readFileSync('base_logic.js', 'utf8');
const match = code.match(/NAME_MAPPING\s*=\s*({[\s\S]*?})/);
if (match) {
    const fn = new Function('return ' + match[1]);
    const map = fn();
    console.log('Mapping for بيض ابيض شنطة 30 بيضة:', map['بيض ابيض شنطة 30 بيضة']);
    let hasIt = Object.keys(map).some(k => k.trim() === 'بيض ابيض شنطة 30 بيضة');
    console.log('Key exists (trimmed)?', hasIt);
    let exactRaw = 'بيض ابيض شنطة 30 بيضة';
    console.log('Exact key exists?', exactRaw in map);
    console.log('Map keys length:', Object.keys(map).length);
}
