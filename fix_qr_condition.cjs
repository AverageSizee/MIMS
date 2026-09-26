const fs = require('fs');
let content = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const searchStr = `setMaterials(matRes.data || []);`;
const replaceStr = `// also fetch suppliers to map them
        const { data: allSuppliers } = await supabase.from('suppliers').select('primary_materials_supplied');
        let materialsWithSuppliers = new Set();
        if (allSuppliers) {
          allSuppliers.forEach(s => {
            if (s.primary_materials_supplied) {
              s.primary_materials_supplied.split(', ').forEach(m => materialsWithSuppliers.add(m.trim()));
            }
          });
        }
        
        const mappedMaterials = (matRes.data || []).map(m => ({
          ...m,
          has_supplier: materialsWithSuppliers.has(m.material_description)
        }));
        
        setMaterials(mappedMaterials);`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
  console.log('Supplier check injected!');
} else {
  console.log('Target string not found.');
}

const qrBtnDesktopOld = `<button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>`;
const qrBtnDesktopNew = `{m.has_supplier && (\r
                            <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>\r
                            )}`;

if (content.includes(qrBtnDesktopOld.replace(/\r/g, ''))) {
    content = content.replace(qrBtnDesktopOld.replace(/\r/g, ''), qrBtnDesktopNew.replace(/\r/g, ''));
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Desktop conditionally wrapped (LF)');
} else if (content.includes(qrBtnDesktopOld.replace(/\r/g, '\r\n'))) {
    content = content.replace(qrBtnDesktopOld.replace(/\r/g, '\r\n'), qrBtnDesktopNew.replace(/\r/g, '\r\n'));
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Desktop conditionally wrapped (CRLF)');
} else {
    console.log('Desktop QR btn not found');
}

const qrBtnMobileOld = `<button onClick={() => setQrMaterial(m)} className="p-2 text-purple-600 bg-purple-50 rounded-lg ml-2">\r
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                      </button>`;
const qrBtnMobileNew = `{m.has_supplier && (\r
                      <button onClick={() => setQrMaterial(m)} className="p-2 text-purple-600 bg-purple-50 rounded-lg ml-2">\r
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                      </button>\r
                      )}`;

if (content.includes(qrBtnMobileOld.replace(/\r/g, ''))) {
    content = content.replace(qrBtnMobileOld.replace(/\r/g, ''), qrBtnMobileNew.replace(/\r/g, ''));
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Mobile conditionally wrapped (LF)');
} else if (content.includes(qrBtnMobileOld.replace(/\r/g, '\r\n'))) {
    content = content.replace(qrBtnMobileOld.replace(/\r/g, '\r\n'), qrBtnMobileNew.replace(/\r/g, '\r\n'));
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Mobile conditionally wrapped (CRLF)');
} else {
    console.log('Mobile QR btn not found');
}
