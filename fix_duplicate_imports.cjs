const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let text = fs.readFileSync('src/pages/' + file, 'utf8');
    
    const importStr = `import React, { Suspense, lazy } from 'react';\nconst QRScannerModal = lazy(() => import('../components/QRScannerModal'));\n`;
    while(text.includes(importStr)) {
        text = text.replace(importStr, '');
    }
    
    text = importStr + text;
    fs.writeFileSync('src/pages/' + file, text, 'utf8');
});

let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
const supImport = `import SupplierQRModal from '../components/SupplierQRModal';\n`;
while(sup.includes(supImport)) {
    sup = sup.replace(supImport, '');
}
sup = supImport + sup;
fs.writeFileSync('src/pages/Suppliers.jsx', sup, 'utf8');
