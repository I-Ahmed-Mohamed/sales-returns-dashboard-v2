const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
let html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on('error', (...args) => console.log('ERROR:', ...args));
virtualConsole.on('warn', (...args) => console.log('WARN:', ...args));
virtualConsole.on('log', (...args) => console.log('LOG:', ...args));

const dom = new JSDOM(html, { 
    runScripts: 'dangerously', 
    resources: 'usable',
    virtualConsole 
});
dom.window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('App html:', dom.window.document.getElementById('app').innerHTML.substring(0, 100));
        process.exit(0);
    }, 2000);
});
