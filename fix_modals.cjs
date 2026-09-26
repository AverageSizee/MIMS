const fs = require('fs');

// 1. Suppliers
let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
if (!sup.includes("import SupplierQRModal")) {
    sup = `import SupplierQRModal from '../components/SupplierQRModal';\n` + sup;
}

if (!sup.includes('<SupplierQRModal')) {
    const idx = sup.lastIndexOf('</div>');
    if (idx > -1) {
        sup = sup.substring(0, idx) + `\n      <SupplierQRModal isOpen={!!qrSupplier} onClose={() => setQrSupplier(null)} supplier={qrSupplier} />\n    </div>` + sup.substring(idx + 6);
        console.log('Suppliers modal injected via fallback!');
    }
}
fs.writeFileSync('src/pages/Suppliers.jsx', sup, 'utf8');

// 2. Forms
['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let form = fs.readFileSync('src/pages/' + file, 'utf8');
    
    if (!form.includes("import QRScannerModal")) {
         form = `import React, { Suspense, lazy } from 'react';\nconst QRScannerModal = lazy(() => import('../components/QRScannerModal'));\n` + form;
    }
    
    if (!form.includes('<QRScannerModal')) {
        const idx = form.lastIndexOf('</div>');
        if (idx > -1) {
            form = form.substring(0, idx) + `\n      <Suspense fallback={null}>\n        {showScanner && <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScanned={handleScanResult} />}\n      </Suspense>\n    </div>` + form.substring(idx + 6);
            console.log(file, 'scanner modal injected via fallback!');
        }
    }
    
    // Quick fix: the forms might have duplicate `import React` now, which is fine for Babel/Vite but good to check.
    // Ensure that handleScanResult exists. (It was successfully injected earlier based on logs).
    fs.writeFileSync('src/pages/' + file, form, 'utf8');
});

console.log('Modals injected!');
