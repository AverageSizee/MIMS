const fs = require('fs');

let content = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const searchBtn = `<button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>`;

const replaceBtn = `{m.has_supplier && (\r
                            <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>\r
                          )}`;

if (content.includes(searchBtn.replace(/\r/g, ''))) {
    content = content.replace(searchBtn.replace(/\r/g, ''), replaceBtn.replace(/\r/g, ''));
    console.log('Replaced LF');
} else if (content.includes(searchBtn.replace(/\r/g, '\r\n'))) {
    content = content.replace(searchBtn.replace(/\r/g, '\r\n'), replaceBtn.replace(/\r/g, '\r\n'));
    console.log('Replaced CRLF');
} else {
    console.log('Not found');
}

fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
