const fs = require('fs');
let c = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const target = `<button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>`;

const targetLF = target.replace(/\r/g, '');
const targetCRLF = target.replace(/\r/g, '\r\n');

const replaceLF = `{m.has_supplier && (\n                            ` + targetLF + `\n                            )}`;

if (c.includes(targetCRLF)) {
    c = c.replace(targetCRLF, replaceLF.replace(/\n/g, '\r\n'));
    fs.writeFileSync('src/pages/Materials.jsx', c, 'utf8');
    console.log('Replaced CRLF');
} else if (c.includes(targetLF)) {
    c = c.replace(targetLF, replaceLF);
    fs.writeFileSync('src/pages/Materials.jsx', c, 'utf8');
    console.log('Replaced LF');
} else {
    console.log('Not found');
}
