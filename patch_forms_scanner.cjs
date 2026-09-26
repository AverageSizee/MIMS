const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let content = fs.readFileSync(`src/pages/${file}`, 'utf8');

    // 1. Add lazy import for Scanner Modal
    const importLazy = `import React, { Suspense, lazy } from 'react';\nconst QRScannerModal = lazy(() => import('../components/QRScannerModal'));\n`;
    if (!content.includes('QRScannerModal')) {
        content = content.replace(`import { useState, useEffect } from 'react';`, `import { useState, useEffect } from 'react';\n${importLazy}`);
    }

    // 2. Add scanner state and scan handler
    const hookStart = `const [editingId, setEditingId] = useState(null);`;
    const newHooks = `const [editingId, setEditingId] = useState(null);\n  const [showScanner, setShowScanner] = useState(false);\n
  const handleScanResult = (resultText) => {
      setShowScanner(false);
      try {
          const data = JSON.parse(resultText);
          const mat = materials.find(m => m.material_description === data.m);
          setFormData(prev => ({
              ...prev,
              supplier_id: data.s || prev.supplier_id,
              material_id: mat ? mat.id : prev.material_id
          }));
          setShowForm(true);
      } catch (e) {
          alert('Invalid QR Code format.');
      }
  };\n`;
    if (!content.includes('showScanner')) {
        content = content.replace(hookStart, newHooks);
    }

    // 3. Add Scan button to header
    const addRecordOld = `{showForm ? 'Cancel' : 'Add Record'}\r\n        </button>\r\n      </div>`;
    const addRecordNew = `{showForm ? 'Cancel' : 'Add Record'}\r\n        </button>\r\n        <button onClick={() => setShowScanner(true)} title="Scan QR Code to auto-fill form" className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium ml-2">\r\n          \uD83D\uDCF7 Scan QR\r\n        </button>\r\n      </div>`;
    
    if (content.includes(addRecordOld.replace(/\r/g, ''))) {
        content = content.replace(addRecordOld.replace(/\r/g, ''), addRecordNew.replace(/\r/g, ''));
    } else if (content.includes(addRecordOld.replace(/\r/g, '\r\n'))) {
        content = content.replace(addRecordOld.replace(/\r/g, '\r\n'), addRecordNew.replace(/\r/g, '\r\n'));
    }

    // 4. Add Suspense Modal rendering at the bottom
    const modalTarget = `</div>\r\n    </div>\r\n  );\r\n}`;
    const modalNew = `</div>\r\n      <Suspense fallback={null}>\r\n        {showScanner && <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScanned={handleScanResult} />}\r\n      </Suspense>\r\n    </div>\r\n  );\r\n}`;

    if (content.includes(modalTarget.replace(/\r/g, ''))) {
        content = content.replace(modalTarget.replace(/\r/g, ''), modalNew.replace(/\r/g, ''));
    } else if (content.includes(modalTarget.replace(/\r/g, '\r\n'))) {
        content = content.replace(modalTarget.replace(/\r/g, '\r\n'), modalNew.replace(/\r/g, '\r\n'));
    }

    fs.writeFileSync(`src/pages/${file}`, content, 'utf8');
    console.log(`${file} patched with inline scanner`);
});
