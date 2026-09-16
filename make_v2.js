const fs = require('fs');

let baseLogic = fs.readFileSync('base_logic.js', 'utf8');

// We append the new grouping logic
let newLogic = `
// GROUP BY CLIENT
let clientsMap = {};
invoices.forEach(inv => {
    let cName = inv.client;
    if (!clientsMap[cName]) {
        clientsMap[cName] = {
            name: cName,
            items: {},
            totalGross: 0,
            totalNet: 0
        };
    }
    
    // Process Sales
    inv.sales.forEach(s => {
        if (!clientsMap[cName].items[s.name]) {
             clientsMap[cName].items[s.name] = { name: s.name, transactions: [] };
        }
        clientsMap[cName].items[s.name].transactions.push({
            type: 'بيع',
            date: inv.date,
            isoDate: inv.isoDate,
            timestamp: inv.timestamp,
            invId: inv.id,
            originalQty: s.originalQty,
            qty: s.qty,
            price: s.price,
            total: s.total,
            status: s.status
        });
    });
    
    // Process Returns
    inv.returns.forEach(r => {
        if (r.status === 'crossed_out') return; // Hide crossed out returns because they are already deducted from sales
        if (!clientsMap[cName].items[r.name]) {
             clientsMap[cName].items[r.name] = { name: r.name, transactions: [] };
        }
        clientsMap[cName].items[r.name].transactions.push({
            type: 'مرتجع (غير مرتبط)',
            date: inv.date,
            isoDate: inv.isoDate,
            timestamp: inv.timestamp,
            invId: inv.id,
            originalQty: 0,
            qty: -r.qty, // Negative for returns
            price: r.price,
            total: -r.total,
            status: r.status
        });
    });
});

// Finalize clients array
let clients = Object.values(clientsMap).map(c => {
    let itemsArr = Object.values(c.items).map(itm => {
        itm.transactions.sort((a,b) => a.timestamp - b.timestamp);
        itm.totalQty = itm.transactions.reduce((sum, t) => sum + t.qty, 0);
        itm.totalAmt = itm.transactions.reduce((sum, t) => sum + t.total, 0);
        return itm;
    });
    c.items = itemsArr.sort((a,b) => a.name.localeCompare(b.name));
    
    c.totalGross = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.type==='بيع').reduce((s,t)=>s+(t.originalQty*t.price),0), 0);
    c.totalNet = c.items.reduce((sum, itm) => sum + itm.totalAmt, 0);
    c.totalReturns = c.items.reduce((sum, itm) => sum + itm.transactions.filter(t=>t.qty < 0).reduce((s,t)=>s+Math.abs(t.total),0), 0);
    
    return c;
});

clients.sort((a,b) => a.name.localeCompare(b.name));
`;

let htmlTemplate = `const htmlTemplate = \`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة مبيعات العملاء المجمعة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
        .table-header { background-color: #1e3a8a; color: white; }
        .row-hover:hover { background-color: #f3f4f6; }
    </style>
</head>
<body class="bg-gray-100 p-4 lg:p-8">
    <div id="app" class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800"><i class="fa-solid fa-users text-blue-600 mr-2"></i> لوحة مبيعات العملاء (تجميع بالأصناف)</h1>
                <p class="text-gray-500 mt-2">عرض حركة الأصناف المجمعة لكل عميل على حدة</p>
            </div>
            <div class="flex gap-4 w-full md:w-auto">
                <select v-model="selectedClient" class="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">-- اختر العميل --</option>
                    <option v-for="client in clients" :value="client.name">{{ client.name }}</option>
                </select>
                <button @click="printPage" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
                    <i class="fa-solid fa-print"></i> طباعة
                </button>
            </div>
        </div>

        <!-- Client View -->
        <div v-if="activeClient" class="space-y-8">
            
            <!-- Items Loop -->
            <div v-for="item in activeClient.items" :key="item.name" class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div class="bg-gray-50 border-b border-gray-200 p-4">
                    <h2 class="text-xl font-bold text-gray-800"><i class="fa-solid fa-box text-orange-500 ml-2"></i> الصنف: {{ item.name }}</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-right text-sm">
                        <thead class="table-header">
                            <tr>
                                <th class="p-3">التاريخ</th>
                                <th class="p-3">رقم الفاتورة</th>
                                <th class="p-3">النوع</th>
                                <th class="p-3">الكمية الأصلية</th>
                                <th class="p-3">الكمية الصافية</th>
                                <th class="p-3">السعر</th>
                                <th class="p-3">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="t in item.transactions" class="border-b row-hover" :class="{'bg-red-50': t.qty < 0, 'bg-orange-50': t.status === 'partially_returned'}">
                                <td class="p-3 font-semibold">{{ t.date }}</td>
                                <td class="p-3 font-mono text-gray-600">{{ t.invId }}</td>
                                <td class="p-3">
                                    <span v-if="t.qty < 0" class="text-red-600 font-bold"><i class="fa-solid fa-arrow-right-arrow-left"></i> {{ t.type }}</span>
                                    <span v-else class="text-green-600 font-bold"><i class="fa-solid fa-check"></i> {{ t.type }}</span>
                                </td>
                                <td class="p-3 text-gray-400 line-through" v-if="t.qty > 0 && t.originalQty !== t.qty">{{ t.originalQty }}</td>
                                <td class="p-3" v-else>
                                    <span v-if="t.qty > 0">{{ t.originalQty }}</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="p-3 font-bold" :class="t.qty < 0 ? 'text-red-600' : 'text-gray-800'" dir="ltr">{{ t.qty }}</td>
                                <td class="p-3">{{ t.price.toLocaleString() }}</td>
                                <td class="p-3 font-bold" :class="t.total < 0 ? 'text-red-600' : 'text-blue-600'" dir="ltr">{{ t.total.toLocaleString() }}</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-100 font-bold text-gray-800 border-t-2 border-gray-300">
                            <tr>
                                <td colspan="4" class="p-4 text-left text-lg">إجمالي حركة الصنف:</td>
                                <td class="p-4 text-lg text-blue-700" dir="ltr">{{ item.totalQty }}</td>
                                <td></td>
                                <td class="p-4 text-lg text-blue-700" dir="ltr">{{ item.totalAmt.toLocaleString() }} ج.م</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Grand Totals -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow p-6 border-r-4 border-blue-500">
                    <p class="text-gray-500 text-sm font-bold mb-1">إجمالي المبيعات (قبل المرتجعات)</p>
                    <p class="text-3xl font-black text-gray-800">{{ activeClient.totalGross.toLocaleString() }} <span class="text-base text-gray-500">ج.م</span></p>
                </div>
                <div class="bg-white rounded-xl shadow p-6 border-r-4 border-red-500">
                    <p class="text-gray-500 text-sm font-bold mb-1">إجمالي المرتجعات (غير المرتبطة)</p>
                    <p class="text-3xl font-black text-red-600">{{ activeClient.totalReturns.toLocaleString() }} <span class="text-base text-gray-500">ج.م</span></p>
                </div>
                <div class="bg-white rounded-xl shadow p-6 border-r-4 border-green-500">
                    <p class="text-gray-500 text-sm font-bold mb-1">الصافي النهائي</p>
                    <p class="text-3xl font-black text-green-600">{{ activeClient.totalNet.toLocaleString() }} <span class="text-base text-gray-500">ج.م</span></p>
                </div>
            </div>

        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-xl shadow p-12 text-center">
            <i class="fa-solid fa-arrow-pointer text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-2xl font-bold text-gray-500">الرجاء اختيار عميل لعرض بياناته</h3>
        </div>

    </div>

    <script>
        const rawJson = decodeURIComponent("\${encodeURIComponent(JSON.stringify(clients))}");
        const CLIENTS_DATA = JSON.parse(rawJson);

        const { createApp } = Vue;

        createApp({
            data() {
                return {
                    clients: CLIENTS_DATA,
                    selectedClient: ''
                }
            },
            computed: {
                activeClient() {
                    if(!this.selectedClient) return null;
                    return this.clients.find(c => c.name === this.selectedClient);
                }
            },
            methods: {
                printPage() {
                    window.print();
                }
            }
        }).mount('#app');
    </script>
</body>
</html>\`;

fs.writeFileSync('index.html', htmlTemplate);
console.log('Successfully generated HTML!');
\`;

fs.writeFileSync('build_dashboard.js', baseLogic + newLogic + '\n' + htmlTemplate, 'utf8');
console.log('Wrote new build_dashboard.js');
