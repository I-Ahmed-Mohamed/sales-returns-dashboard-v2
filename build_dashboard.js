
const fs = require('fs');
const xlsx = require('C:/Users/SPEED/Desktop/scratch_excel/node_modules/xlsx');

function excelDateToJSDate(serial) {
    if(!serial || isNaN(serial)) return serial;
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    return date_info.toLocaleDateString('ar-EG');
}

function excelDateToISO(serial) {
    if(!serial || isNaN(serial)) return '';
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    let y = date_info.getFullYear();
    let m = String(date_info.getMonth() + 1).padStart(2, '0');
    let d = String(date_info.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

let wbSales = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المبيعات.xlsx');
let salesRows = xlsx.utils.sheet_to_json(wbSales.Sheets['البيانات التفصيلية'], {header:1}).slice(1);

let wbReturns = xlsx.readFile('C:/Users/SPEED/Desktop/كارت المرتجعات.xlsx');
let returnsRows = xlsx.utils.sheet_to_json(wbReturns.Sheets['البيانات التفصيلية'], {header:1}).slice(1);

let invoicesMap = {};

function processRow(row, isReturn) {
    if (!row || !row[2]) return;
    let invNo = String(row[2]).trim();
    if (!invoicesMap[invNo]) {
        invoicesMap[invNo] = {
            id: invNo,
            date: excelDateToJSDate(row[3]),
            isoDate: excelDateToISO(row[3]),
            timestamp: Number(row[3]) || 0,
            client: row[4] || 'عميل غير معروف',
            sales: [],
            returns: []
        };
    }
    
    let item = {
        newName: row[6] || '',
        oldName: row[7] || '',
        qty: Number(row[8]) || 0,
        price: Number(row[9]) || 0,
        discount: Number(row[10]) || 0,
        total: Number(row[11]) || 0
    };
    
    if (!item.newName && !item.oldName) {
        item.newName = row[7] || row[6] || 'صنف غير معروف';
    }
    
    item.name = item.newName || item.oldName;
    
    if (isReturn) {
        invoicesMap[invNo].returns.push(item);
    } else {
        invoicesMap[invNo].sales.push(item);
    }
}

salesRows.forEach(r => processRow(r, false));
returnsRows.forEach(r => processRow(r, true));

// RECONCILE RETURNS WITH SALES
let invoices = Object.values(invoicesMap).sort((a,b) => b.timestamp - a.timestamp);

invoices.forEach(inv => {
    let grossBeforeAnyDiscount = 0;
    let totalDiscountBeforeReturn = 0;
    let originalInvoiceTotal = 0; 
    let totalReturnAmount = 0;
    let netInvoiceTotal = 0; 
    
    let reconciledSales = inv.sales.map(s => ({ ...s, originalQty: s.qty, originalTotal: s.total, originalDiscount: s.discount, deductedQty: 0 }));
    let reconciledReturns = inv.returns.map(r => ({ ...r, deductedQty: 0 }));

    // Match returns to sales
    reconciledReturns.forEach(r => {
        let qtyToDeduct = r.qty;
        reconciledSales.forEach(s => {
            if (s.name === r.name && qtyToDeduct > 0 && s.qty > 0) {
                let deduct = Math.min(s.qty, qtyToDeduct);
                s.qty -= deduct;
                s.deductedQty += deduct;
                
                r.deductedQty += deduct;
                qtyToDeduct -= deduct;
            }
        });
    });

    // Finalize Sales
    reconciledSales.forEach(s => {
        grossBeforeAnyDiscount += (s.originalQty * s.price);
        totalDiscountBeforeReturn += s.originalDiscount;
        originalInvoiceTotal += s.originalTotal;
        
        let proportion = s.originalQty > 0 ? (s.qty / s.originalQty) : 0;
        s.discount = s.originalDiscount * proportion;
        s.total = s.originalTotal * proportion;
        s.status = s.deductedQty > 0 ? 'partially_returned' : 'active';
        
        netInvoiceTotal += s.total;
    });
    
    // Finalize Returns (split if partially matched)
    let finalReturns = [];
    reconciledReturns.forEach(r => {
        totalReturnAmount += r.total;
        if (r.deductedQty > 0) {
            let prop = r.deductedQty / r.qty;
            finalReturns.push({
                ...r,
                qty: r.deductedQty,
                total: r.total * prop,
                status: 'crossed_out'
            });
        }
        let remaining = r.qty - r.deductedQty;
        if (remaining > 0) {
            let prop = remaining / r.qty;
            finalReturns.push({
                ...r,
                qty: remaining,
                total: r.total * prop,
                status: 'active'
            });
        }
    });
    
    inv.sales = reconciledSales;
    inv.returns = finalReturns;
    inv.grossBeforeAnyDiscount = grossBeforeAnyDiscount;
    inv.totalDiscountBeforeReturn = totalDiscountBeforeReturn;
    inv.originalInvoiceTotal = originalInvoiceTotal;
    inv.totalReturnAmount = totalReturnAmount;
    inv.netInvoiceTotal = netInvoiceTotal;
});

const htmlTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة المبيعات والمرتجعات</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #f8fafc; color: #1e293b; }
        .invoice-card { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
        .fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }
        .strikethrough { text-decoration: line-through; opacity: 0.6; color: #ef4444; }
        .copy-icon { cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .copy-icon:hover { opacity: 1; color: #3b82f6; transform: scale(1.1); }
        @media print {
            body { background: white !important; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .invoice-card { box-shadow: none !important; border: 1px solid #000 !important; margin-bottom: 20px !important; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div id="app" class="min-h-screen pb-10">
        
        <nav class="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40 no-print">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-center py-4 md:py-0 md:h-16 gap-4">
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-600 p-2 rounded-lg text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h1 class="text-xl font-bold text-slate-800">لوحة المبيعات والمرتجعات</h1>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
                        <div class="relative w-full sm:w-64">
                            <input type="text" v-model="search" placeholder="ابحث برقم الفاتورة أو العميل..." class="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                            <svg class="w-4 h-4 text-slate-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <div class="relative w-full sm:w-48">
                            <input type="date" v-model="selectedDate" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        </div>
                        <button @click="printAll" class="w-full sm:w-auto justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            طباعة الكل
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 no-print">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">تفاصيل الفواتير</h2>
                    <p class="text-slate-500 mt-1">عرض {{ paginatedInvoices.length }} من أصل {{ filteredInvoices.length }} فاتورة</p>
                </div>
                <div class="flex items-center gap-2" v-if="totalPages > 1">
                    <button @click="prevPage" :disabled="currentPage === 1" class="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
                    <span class="text-sm font-medium px-4">صفحة {{ currentPage }} من {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                </div>
            </div>

            <div class="space-y-6">
                <div v-for="inv in paginatedInvoices" :key="inv.id" class="invoice-card bg-white rounded-xl overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-5 flex justify-between items-center">
                        <div class="flex items-center gap-4">
                            <div class="bg-blue-100 text-blue-700 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg">
                                #
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800">{{ inv.client }}</h3>
                                <div class="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> {{ inv.id }}</span>
                                    <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {{ inv.date }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-4 sm:p-5">

                        <!-- Sales Section -->
                        <div v-if="inv.sales.length > 0" class="mb-6">
                            <h4 class="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                المبيعات
                            </h4>
                            <div class="overflow-x-auto rounded-lg border border-slate-200">
                                <table class="w-full text-sm text-right">
                                    <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th class="py-3 px-4 w-2/5">الصنف (الاسم الجديد)</th>
                                            <th class="py-3 px-4">الصنف (الاسم القديم)</th>
                                            <th class="py-3 px-4 text-center">الكمية الأصلية</th>
                                            <th class="py-3 px-4 text-center">الكمية الصافية</th>
                                            <th class="py-3 px-4 text-center">السعر</th>
                                            <th class="py-3 px-4 text-center">الإجمالي الصافي</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        <tr v-for="item in inv.sales" :class="{'bg-amber-50/60': item.status === 'partially_returned'}">
                                            <td class="py-3 px-4 font-medium flex items-center gap-2">
                                                <span v-if="item.status === 'partially_returned'" title="تم خصم كمية مرتجعة من هذا الصنف" class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded cursor-help whitespace-nowrap">اتخصم منه مرتجع</span>
                                                {{ item.newName }}
                                                <svg @click="copyText(item.newName)" class="w-4 h-4 mr-2 copy-icon no-print shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            </td>
                                            <td class="py-3 px-4 text-slate-500">{{ item.oldName }}</td>
                                            <td class="py-3 px-4 text-center text-slate-400">{{ Number(item.originalQty) }}</td>
                                            <td class="py-3 px-4 text-center font-bold text-slate-800">{{ Number(item.qty) }}</td>
                                            <td class="py-3 px-4 text-center">{{ Number(item.price).toFixed(2) }}</td>
                                            <td class="py-3 px-4 text-center font-bold" :class="item.status === 'partially_returned' ? 'text-amber-700' : 'text-slate-800'">
                                                {{ Number(item.total).toFixed(2) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="bg-slate-100 font-bold border-t-2 border-slate-200">
                                        <tr>
                                            <td colspan="5" class="py-3 px-4 text-left">إجمالي المبيعات (الصافي بعد الخصم والمرتجع):</td>
                                            <td class="py-3 px-4 text-center text-emerald-700 text-base">{{ Number(inv.netInvoiceTotal).toFixed(2) }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Returns Section -->
                        <div v-if="inv.returns.length > 0" class="mb-4">
                            <h4 class="text-sm font-bold text-rose-700 mb-3 border-b border-rose-100 pb-2 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                                المرتجعات
                            </h4>
                            <div class="overflow-x-auto rounded-lg border border-rose-200">
                                <table class="w-full text-sm text-right">
                                    <thead class="bg-rose-50 text-rose-800 font-semibold border-b border-rose-200">
                                        <tr>
                                            <th class="py-2 px-4 w-1/2">الصنف (الاسم الجديد)</th>
                                            <th class="py-2 px-4">الصنف (الاسم القديم)</th>
                                            <th class="py-2 px-4 text-center">الكمية المسترجعة</th>
                                            <th class="py-2 px-4 text-center">السعر</th>
                                            <th class="py-2 px-4 text-center">الإجمالي المسترجع</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-rose-100">
                                        <tr v-for="item in inv.returns" :class="{'strikethrough bg-slate-50': item.status === 'crossed_out'}">
                                            <td class="py-2 px-4 font-medium text-rose-700 flex items-center gap-2">
                                                <span v-if="item.status === 'crossed_out'" class="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded whitespace-nowrap">مخصوم من الفاتورة</span>
                                                <span v-else class="text-xs bg-red-600 text-white px-2 py-0.5 rounded whitespace-nowrap">مرتجع إضافي</span>
                                                {{ item.newName }}
                                                <svg @click="copyText(item.newName)" class="w-4 h-4 mr-2 copy-icon no-print shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            </td>
                                            <td class="py-2 px-4 text-rose-600/70">{{ item.oldName }}</td>
                                            <td class="py-2 px-4 text-center font-bold text-rose-600">{{ Number(item.qty) }}</td>
                                            <td class="py-2 px-4 text-center">{{ Number(item.price).toFixed(2) }}</td>
                                            <td class="py-2 px-4 text-center font-bold text-rose-700">{{ Number(item.total).toFixed(2) }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="bg-rose-50 font-bold border-t-2 border-rose-200 text-rose-800">
                                        <tr>
                                            <td colspan="4" class="py-3 px-4 text-left">إجمالي المرتجعات لهذه الفاتورة:</td>
                                            <td class="py-3 px-4 text-center text-rose-700 text-base">{{ Number(inv.totalReturnAmount).toFixed(2) }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Summary Block (moved to bottom) -->
                        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div>
                                <p class="text-xs text-slate-500 mb-1">الإجمالي قبل الخصم (للمبيعات الأصلية)</p>
                                <p class="text-lg font-bold text-slate-700">{{ Number(inv.grossBeforeAnyDiscount).toFixed(2) }} ج</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 mb-1">إجمالي الخصم (للمبيعات الأصلية)</p>
                                <p class="text-lg font-bold text-blue-600">{{ Number(inv.totalDiscountBeforeReturn).toFixed(2) }} ج</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 mb-1">إجمالي المرتجع من الفاتورة</p>
                                <p class="text-lg font-bold text-rose-600">{{ Number(inv.totalReturnAmount).toFixed(2) }} ج</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 mb-1">صافي الفاتورة النهائي</p>
                                <p class="text-lg font-bold text-emerald-600">{{ Number(inv.netInvoiceTotal).toFixed(2) }} ج</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <div v-if="filteredInvoices.length === 0" class="text-center py-20 text-slate-500">
                <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <p class="text-lg">لا يوجد بيانات مطابقة للبحث أو التاريخ</p>
            </div>
            
            <!-- Toast -->
            <transition name="fade">
                <div v-if="showToast" class="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded shadow-lg flex items-center gap-2 z-50">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>تم النسخ بنجاح!</span>
                </div>
            </transition>
        </main>
    </div>

    <script>
        const rawJson = decodeURIComponent("${encodeURIComponent(JSON.stringify(invoices))}");
        const INVOICES_DATA = JSON.parse(rawJson);

        const { createApp } = Vue;

        createApp({
            data() {
                return {
                    search: '',
                    selectedDate: '',
                    invoices: INVOICES_DATA,
                    currentPage: 1,
                    itemsPerPage: 30,
                    showToast: false,
                    toastTimeout: null
                }
            },
            computed: {
                filteredInvoices() {
                    let result = this.invoices;
                    
                    if (this.selectedDate) {
                        result = result.filter(inv => inv.isoDate === this.selectedDate);
                    }
                    
                    if (this.search.trim()) {
                        const q = this.search.toLowerCase();
                        result = result.filter(inv => {
                            if (String(inv.id).includes(q)) return true;
                            if (String(inv.client).toLowerCase().includes(q)) return true;
                            return false;
                        });
                    }
                    
                    return result;
                },
                totalPages() {
                    return Math.ceil(this.filteredInvoices.length / this.itemsPerPage) || 1;
                },
                paginatedInvoices() {
                    const start = (this.currentPage - 1) * this.itemsPerPage;
                    return this.filteredInvoices.slice(start, start + this.itemsPerPage);
                }
            },
            methods: {
                nextPage() {
                    if (this.currentPage < this.totalPages) {
                        this.currentPage++;
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                },
                prevPage() {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                },
                copyText(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        this.showToast = true;
                        clearTimeout(this.toastTimeout);
                        this.toastTimeout = setTimeout(() => {
                            this.showToast = false;
                        }, 2000);
                    });
                },
                printAll() {
                    window.print();
                }
            }
        }).mount('#app')
    </script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlTemplate);
console.log('Successfully built updated dashboard with original quantity column!');
