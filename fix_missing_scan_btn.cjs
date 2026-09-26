const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let form = fs.readFileSync('src/pages/' + file, 'utf8');
    
    const showFormIdx = form.indexOf(`showForm ? 'Cancel'`);
    if (showFormIdx > -1) {
        const endBtn = form.indexOf('</button>', showFormIdx) + 9;
        const checkStr = form.substring(endBtn, endBtn + 200);
        
        if (!checkStr.includes('Scan QR')) {
            const scanCode = `\n        <button onClick={() => setShowScanner(true)} title="Scan QR Code to auto-fill form" className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium ml-2">\n          📷 Scan QR\n        </button>`;
            
            form = form.substring(0, endBtn) + scanCode + form.substring(endBtn);
            fs.writeFileSync('src/pages/' + file, form, 'utf8');
            console.log(file, 'Scan button added!');
        } else {
            console.log(file, 'already has Scan QR button');
        }
    }
});
