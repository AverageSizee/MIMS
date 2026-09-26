const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx', 'Materials.jsx', 'Suppliers.jsx'].forEach(file => {
    try {
        const c = fs.readFileSync('src/pages/' + file, 'utf8');
        
        // Find available columns definition
        const availStart = c.indexOf('availableColumns = [');
        let availCols = [];
        if (availStart > -1) {
            const availBlock = c.substring(availStart, c.indexOf('];', availStart));
            const matches = availBlock.match(/id:\s*'([^']+)'/g);
            if (matches) availCols = matches.map(m => m.match(/'([^']+)'/)[1]);
            if (c.includes(`id: 'created_by'`)) availCols.push('created_by');
            if (c.includes(`id: 'updated_by'`)) availCols.push('updated_by');
        }
        
        const start = c.indexOf('className="md:hidden');
        if (start > -1) {
            const end = c.indexOf('))}', start) > -1 ? c.indexOf('))}', start) : c.indexOf(')}', start + 1000);
            const mobileBlock = c.substring(start, end + 100);
            const cols = mobileBlock.match(/visibleColumns\.includes\('([^']+)'\)/g);
            let mobileCols = [];
            if (cols) mobileCols = [...new Set(cols.map(m => m.match(/'([^']+)'/)[1]))];
            
            console.log(`\n--- ${file} ---`);
            console.log('Available:', availCols);
            console.log('Mobile   :', mobileCols);
            
            const missing = availCols.filter(col => !mobileCols.includes(col) && col !== 'id_date');
            console.log('MISSING IN MOBILE:', missing);
        }
    } catch(e) { console.error(e) }
});
