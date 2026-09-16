const fs = require('fs');

let c = fs.readFileSync('build_dashboard.js', 'utf8');

c = c.replace(
    '<div class="flex justify-between items-center h-16">', 
    '<div class="flex flex-col md:flex-row justify-between items-center py-4 md:py-0 md:h-16 gap-4">'
);

c = c.replace(
    '<div class="flex items-center gap-4">',
    '<div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">'
);

c = c.replace(
    '<div class="relative w-64">',
    '<div class="relative w-full sm:w-64">'
);

c = c.replace(
    '<div class="relative w-48">',
    '<div class="relative w-full sm:w-48">'
);

c = c.replace(
    '<button @click="printAll" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">',
    '<button @click="printAll" class="w-full sm:w-auto justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">'
);

c = c.replace(
    '<div class="mb-6 flex justify-between items-end no-print">',
    '<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 no-print">'
);

fs.writeFileSync('build_dashboard.js', c, 'utf8');
console.log('Responsiveness patched!');
