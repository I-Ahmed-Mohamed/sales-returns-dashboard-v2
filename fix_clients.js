const fs = require('fs');
let code = fs.readFileSync('base_logic.js', 'utf8');

const normalizeClientCode = `
        let clientName = row[4] || 'غير معروف';
        
        // --- Client Name Normalization ---
        if (clientName.includes('سوبر سنتر')) {
            clientName = 'سوبر سنتر لتجارة وتوزيع المواد الغذائية';
        } else if (clientName.includes('ماف') || clientName.includes('كارفور')) {
            clientName = 'ماف للهايبر ماركتس (كارفور)';
        } else if (clientName.includes('اللولو')) {
            clientName = 'اللولو للأسواق التجارية (لولو)';
        } else if (clientName.includes('اوسكار')) {
            clientName = 'أوسكار جراند ستورز (Oscar)';
        } else if (clientName.includes('بنده') || clientName.includes('بندة')) {
            clientName = 'بنده العالمية (Panda)';
        } else if (clientName.includes('كازيون')) {
            clientName = 'كازيون ماركت (Kazyon)';
        } else if (clientName.includes('سوق دوت كوم')) {
            clientName = 'سوق دوت كوم (أمازون)';
        } else if (clientName.includes('سبينيس')) {
            clientName = 'سبينيس ايجيبت (Spinneys)';
        } else if (clientName.includes('الفار')) {
            clientName = 'شركة الفار التجارية';
        } else if (clientName.includes('الديار')) {
            clientName = 'الديار القطرية للاستثمار';
        } else if (clientName.includes('ماريوت')) {
            clientName = 'فندق ماريوت مينا هاوس';
        } else if (clientName.includes('اولاد رجب')) {
            clientName = 'أولاد رجب (Awlad Ragab)';
        } else if (clientName.includes('آفاق')) {
            clientName = 'آفاق للاستثمار السياحي';
        } else if (clientName.includes('رابيا')) {
            clientName = 'نيو رابيا للتجارة والتوزيع';
        } else if (clientName.includes('جودز مارت')) {
            clientName = 'جودز مارت (GoodsMart)';
        } else if (clientName.includes('زهران')) {
            clientName = 'زهران ماركت';
        }
        
        invoicesMap[invNo] = {
            id: invNo,
            date: excelDateToJSDate(row[3]),
            isoDate: excelDateToISO(row[3]),
            timestamp: Number(row[3]) || 0,
            client: clientName,
            sales: [],
            returns: []
        };`;

code = code.replace(/invoicesMap\[invNo\] = \{[\s\S]*?returns: \[\]\s*\};/, normalizeClientCode);
fs.writeFileSync('base_logic.js', code, 'utf8');
console.log('Injected successfully!');
