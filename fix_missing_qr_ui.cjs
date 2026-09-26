const fs = require('fs');

// 1. Suppliers.jsx
let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');

// desktop btn
const btnMatch = `onClick={() => handleEdit(s)}`;
const idx = sup.indexOf(btnMatch);
if (idx > -1) {
    const endBtn = sup.indexOf('</button>', idx) + 9;
    const buttonHtml = sup.substring(idx - 14, endBtn); // from <button to </button>
    
    if (!sup.includes('setQrSupplier(s)')) {
        const qrBtn = `\n                          <button onClick={() => setQrSupplier(s)} title="View QR Codes" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\n                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\n                          </button>`;
        sup = sup.substring(0, endBtn) + qrBtn + sup.substring(endBtn);
        console.log('Suppliers desktop QR button added!');
    }
}

// mobile btn
const mobileBtnMatch = `onClick={() => handleEdit(s)} className="p-2 text-blue-600 bg-blue-50 rounded-lg`;
const idxMob = sup.lastIndexOf(mobileBtnMatch);
if (idxMob > -1 && idxMob !== idx) {
    const endMob = sup.indexOf('</button>', idxMob) + 9;
    const buttonMobHtml = sup.substring(idxMob - 8, endMob);
    
    // Check if it already exists here
    const checkString = sup.substring(endMob, endMob + 100);
    if (!checkString.includes('setQrSupplier(s)')) {
        const qrMob = `\n                      <button onClick={() => setQrSupplier(s)} className="p-2 text-purple-600 bg-purple-50 rounded-lg shrink-0 ml-2">\n                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\n                      </button>`;
        sup = sup.substring(0, endMob) + qrMob + sup.substring(endMob);
        console.log('Suppliers mobile QR button added!');
    }
}

// Supplier Modal logic (if missing)
const supModal = `<SupplierQRModal isOpen={!!qrSupplier} onClose={() => setQrSupplier(null)} supplier={qrSupplier} />`;
if (!sup.includes(supModal)) {
    const endDiv = `</div>\r\n    </div>\r\n  );\r\n}`;
    const endDivLF = `</div>\n    </div>\n  );\n}`;
    if (sup.includes(endDiv)) {
        sup = sup.replace(endDiv, `</div>\r\n      ${supModal}\r\n    </div>\r\n  );\r\n}`);
    } else if (sup.includes(endDivLF)) {
        sup = sup.replace(endDivLF, `</div>\n      ${supModal}\n    </div>\n  );\n}`);
    }
}

fs.writeFileSync('src/pages/Suppliers.jsx', sup, 'utf8');

// 2. Deliveries, Issuances, Returns
['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let form = fs.readFileSync('src/pages/' + file, 'utf8');
    
    // Check for showScanner state, if missing, this was completely botched
    if (form.includes('const [showScanner')) {
        console.log(file, 'already has showScanner');
    }
    
    // Check for "Scan QR" button
    const addRecordMatches = [...form.matchAll(/>\s*\{\s*showForm\s*\?\s*'Cancel'\s*:\s*'Add Record'\s*\}\s*<\/button>/g)];
    if (addRecordMatches.length > 0) {
        const match = addRecordMatches[0];
        const insertionIndex = match.index + match[0].length;
        
        const scanCode = `\n        <button onClick={() => setShowScanner(true)} title="Scan QR Code to auto-fill form" className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium ml-2">\n          📷 Scan QR\n        </button>`;
        
        // If not already injected right after
        const checkStr = form.substring(insertionIndex, insertionIndex + 200);
        if (!checkStr.includes('Scan QR')) {
            form = form.substring(0, insertionIndex) + scanCode + form.substring(insertionIndex);
            console.log(file, 'Scan button added!');
            fs.writeFileSync('src/pages/' + file, form, 'utf8');
        }
    } else {
        console.log(file, 'Add Record button not found!');
        
        // let's do a more robust find
        const addRecAlt = form.indexOf('Add New Record'); // Modal title, not button
        // Let's find "Add Record" literal
        const addBtn = form.indexOf(`showForm ? 'Cancel' : 'Add `); // 'Add Delivery' maybe?
        if (addBtn > -1) {
            const endBtn = form.indexOf('</button>', addBtn) + 9;
            const scanCode = `\n        <button onClick={() => setShowScanner(true)} title="Scan QR Code to auto-fill form" className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium ml-2">\n          📷 Scan QR\n        </button>`;
            if (!form.substring(endBtn, endBtn + 200).includes('Scan QR')) {
                form = form.substring(0, endBtn) + scanCode + form.substring(endBtn);
                console.log(file, 'Scan button added via alt method!');
                fs.writeFileSync('src/pages/' + file, form, 'utf8');
            }
        }
    }
});
