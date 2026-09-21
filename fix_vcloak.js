const fs = require('fs');
let html = fs.readFileSync('template.html', 'utf8');
html = html.replace('<div id="app" class="w-full">', '<div id="app" class="w-full" v-cloak>');
fs.writeFileSync('template.html', html, 'utf8');
console.log('Added v-cloak to #app');
