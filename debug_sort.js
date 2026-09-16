const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
let match = c.match(/decodeURIComponent\(\"(.*?)\"\)/);
if(match) {
    let data = JSON.parse(decodeURIComponent(match[1]));
    let client = data.find(cl => cl.items.some(i => i.name.includes('18')));
    if (client) {
        console.log('Client:', client.name);
        client.items.forEach(i => console.log(i.name, '=>', parseInt((i.name.match(/\d+/) || [0])[0])));
    }
}
