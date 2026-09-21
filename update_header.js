const fs = require('fs');
let html = fs.readFileSync('template.html', 'utf8');

const oldHeaderRegex = /<div class="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-200">[\s\S]*?<\/div>\s*<\/div>/;

const newHeader = `
        <!-- Modern Header -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-2xl shadow-xl mb-6 flex flex-col xl:flex-row items-center justify-between gap-5 border border-slate-700 relative overflow-hidden no-print">
            <!-- Decorative background elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

            <!-- Title Section -->
            <div class="flex items-center gap-4 z-10 w-full xl:w-auto">
                <div class="bg-blue-500/20 p-3.5 rounded-xl text-blue-400 backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <i class="fas fa-chart-pie text-2xl"></i>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white tracking-wide">لوحة مبيعات العملاء</h1>
                    <p class="text-slate-400 text-sm mt-1 flex items-center gap-2">
                        <i class="fas fa-layer-group text-xs"></i> نظام التجميع والتحليل المتقدم للأصناف
                    </p>
                </div>
            </div>

            <!-- Controls Section -->
            <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end z-10 bg-slate-900/50 p-2.5 rounded-xl backdrop-blur-sm border border-slate-700/50 shadow-inner">
                
                <!-- Month Filter -->
                <div class="relative group w-full sm:w-auto">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <select v-model="selectedMonth" class="bg-slate-800/80 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 pl-8 py-2.5 appearance-none hover:bg-slate-700 transition cursor-pointer outline-none">
                        <option value="all">عرض جميع الشهور (4 و 5)</option>
                        <option value="4">تقرير شهر أبريل (4)</option>
                        <option value="5">تقرير شهر مايو (5)</option>
                    </select>
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                </div>
                
                <!-- Global Search -->
                <div class="relative w-full sm:w-auto flex-grow xl:flex-grow-0">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <i class="fas fa-search"></i>
                    </div>
                    <input type="text" v-model="globalSearch" placeholder="بحث شامل (عميل، فاتورة، صنف)..." class="bg-slate-800/80 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 pl-4 py-2.5 xl:w-64 hover:bg-slate-700 transition placeholder-slate-400 outline-none">
                </div>

                <div class="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

                <button @click="showSidebar = true" class="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:-translate-y-0.5">
                    <i class="fas fa-users-viewfinder"></i>
                    <span>تحديد العميل</span>
                </button>

                <button onclick="window.print()" class="w-full sm:w-auto justify-center bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 border border-slate-600 hover:border-slate-400 hover:-translate-y-0.5" title="طباعة التقرير">
                    <i class="fas fa-print"></i>
                    <span class="sm:hidden">طباعة التقرير</span>
                </button>
            </div>
        </div>`;

if (oldHeaderRegex.test(html)) {
    html = html.replace(oldHeaderRegex, newHeader);
    fs.writeFileSync('template.html', html, 'utf8');
    console.log('Header updated successfully!');
} else {
    console.log('Could not find the old header to replace!');
}
