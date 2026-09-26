const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let form = fs.readFileSync('src/pages/' + file, 'utf8');

    // Find the button cluster
    const h2End = `</h2>`;
    const btnClusterStart = form.indexOf(h2End);
    if (btnClusterStart > -1) {
        // We will insert `<div className="flex items-center gap-2">` after the `</h2>`
        // and `</div>` after the `Scan QR` button.

        // Locate the Add Record button
        const addBtnStr = `className="bg-blue-600 text-white`;
        const addBtnStart = form.lastIndexOf('<button', form.indexOf(addBtnStr));
        
        // Locate the Scan QR button
        const scanBtnStr = `onClick={() => setShowScanner(true)}`;
        let scanBtnEnd = form.indexOf('</button>', form.indexOf(scanBtnStr));
        
        if (addBtnStart > -1 && scanBtnEnd > -1) {
            scanBtnEnd += 9; // length of </button>
            
            let buttonCluster = form.substring(addBtnStart, scanBtnEnd);
            
            // Modify the Scan button to be an icon only
            const iconOnlyScanBtn = `<button onClick={() => setShowScanner(true)} title="Scan QR Code" className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">\n          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\n        </button>`;
            
            // Replace the old scan button with the new icon one
            // First we need to extract just the add button text since we know the structure
            const oldScanBtnStart = buttonCluster.indexOf('<button onClick={() => setShowScanner(true)}');
            const newCluster = buttonCluster.substring(0, oldScanBtnStart) + iconOnlyScanBtn;
            
            const wrappedCluster = `\n        <div className="flex items-center gap-2">\n          ${newCluster.trim()}\n        </div>`;
            
            form = form.substring(0, addBtnStart) + wrappedCluster + form.substring(scanBtnEnd);
            fs.writeFileSync('src/pages/' + file, form, 'utf8');
            console.log(file, 'buttons wrapped and styled successfully!');
        }
    }
});
