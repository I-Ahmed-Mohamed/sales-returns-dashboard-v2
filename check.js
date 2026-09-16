const fs = require('fs');
const compiler = require('@vue/compiler-dom');
let html = fs.readFileSync('template.html', 'utf8');
let body = html.split('<body')[1].split('</body>')[0];
let app = body.split('<script')[0];
let res = compiler.compile('<div>' + app + '</div>');
console.log(res.errors);
