const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/decodeURIComponent\(\"(.*?)\"\)/);
const clients = JSON.parse(decodeURIComponent(match[1]));
let panda = clients.find(c => c.name.includes('بندة') || c.name.includes('بنده'));
if(panda) {
    panda.items.forEach(i => {
        let name = i.newName || i.name;
        if (name.includes('احمر') && name.includes('20')) {
            console.log('--- NAME ---');
            console.log('"' + name + '"');
            console.log('Char codes:', [...name].map(c => c.charCodeAt(0)).join(','));
        }
    });
}
