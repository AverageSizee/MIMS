const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let form = fs.readFileSync('src/pages/' + file, 'utf8');
    
    // Add profile to useAuth destructured variables
    if (form.includes('const { user, isManager } = useAuth();')) {
        form = form.replace('const { user, isManager } = useAuth();', 'const { user, profile, isManager } = useAuth();');
    }
    
    // Auto-populate based on file
    let newHandler = '';
    if (file === 'Deliveries.jsx' || file === 'Returns.jsx') {
        newHandler = `const handleScanResult = (resultText) => {
      setShowScanner(false);
      try {
          const data = JSON.parse(resultText);
          const mat = materials.find(m => m.material_description === data.m);
          setFormData(prev => ({
              ...prev,
              supplier_id: data.s || prev.supplier_id,
              material_id: mat ? mat.id : prev.material_id,
              received_by: profile?.full_name || prev.received_by
          }));
          setShowForm(true);
      } catch (e) {
          alert('Invalid QR Code format.');
      }
  };`;
    } else if (file === 'Issuances.jsx') {
        newHandler = `const handleScanResult = (resultText) => {
      setShowScanner(false);
      try {
          const data = JSON.parse(resultText);
          const mat = materials.find(m => m.material_description === data.m);
          setFormData(prev => ({
              ...prev,
              supplier_id: data.s || prev.supplier_id,
              material_id: mat ? mat.id : prev.material_id,
              released_by: profile?.full_name || prev.released_by
          }));
          setShowForm(true);
      } catch (e) {
          alert('Invalid QR Code format.');
      }
  };`;
    }
    
    // Replace the old handleScanResult
    const oldHandlerStart = form.indexOf('const handleScanResult');
    if (oldHandlerStart > -1) {
        // Need to be careful about finding the end of the old function. It usually ends with `};`
        const catchBlockStr = `alert('Invalid QR Code format.');\r\n      }\r\n  };`;
        const catchBlockStrLF = `alert('Invalid QR Code format.');\n      }\n  };`;
        
        let oldHandlerEnd = form.indexOf(catchBlockStr, oldHandlerStart);
        if (oldHandlerEnd > -1) oldHandlerEnd += catchBlockStr.length;
        else {
             oldHandlerEnd = form.indexOf(catchBlockStrLF, oldHandlerStart);
             if (oldHandlerEnd > -1) oldHandlerEnd += catchBlockStrLF.length;
             else {
                 // Try another string
                 const altCatch = `alert('Invalid QR Code format');\n      }\n  };`;
                 oldHandlerEnd = form.indexOf(altCatch, oldHandlerStart);
                 if (oldHandlerEnd > -1) oldHandlerEnd += altCatch.length;
             }
        }
        
        if (oldHandlerEnd > -1) {
            form = form.substring(0, oldHandlerStart) + newHandler + form.substring(oldHandlerEnd);
            fs.writeFileSync('src/pages/' + file, form, 'utf8');
            console.log(file, 'patched handleScanResult!');
        } else {
            console.log(file, 'could not find end of handleScanResult');
            // Hard fallback
            const eIdx = form.indexOf('};', form.indexOf('catch', oldHandlerStart));
            if (eIdx > -1) {
                form = form.substring(0, oldHandlerStart) + newHandler + form.substring(eIdx+2);
                fs.writeFileSync('src/pages/' + file, form, 'utf8');
                console.log(file, 'patched handleScanResult (fallback)');
            }
        }
    }
});
