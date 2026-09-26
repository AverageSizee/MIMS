const fs = require('fs');

let content = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const searchDesktop = `<button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>\r
                            </button>`;

const replaceDesktop = `<button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>\r
                            </button>\r
                            <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>`;

let replaced = false;

if (content.includes(searchDesktop.replace(/\r/g, ''))) {
    content = content.replace(searchDesktop.replace(/\r/g, ''), replaceDesktop.replace(/\r/g, ''));
    replaced = true;
    console.log('Desktop button replaced (LF).');
} else if (content.includes(searchDesktop.replace(/\r/g, '\r\n'))) {
    content = content.replace(searchDesktop.replace(/\r/g, '\r\n'), replaceDesktop.replace(/\r/g, '\r\n'));
    replaced = true;
    console.log('Desktop button replaced (CRLF).');
}

const searchMobile = `<button onClick={() => handleEdit(m)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">\r
                        <Edit2 className="w-4 h-4" />\r
                      </button>`;

const replaceMobile = `<button onClick={() => handleEdit(m)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">\r
                        <Edit2 className="w-4 h-4" />\r
                      </button>\r
                      <button onClick={() => setQrMaterial(m)} className="p-2 text-purple-600 bg-purple-50 rounded-lg ml-2">\r
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                      </button>`;

if (content.includes(searchMobile.replace(/\r/g, ''))) {
    content = content.replace(searchMobile.replace(/\r/g, ''), replaceMobile.replace(/\r/g, ''));
    replaced = true;
    console.log('Mobile button replaced (LF).');
} else if (content.includes(searchMobile.replace(/\r/g, '\r\n'))) {
    content = content.replace(searchMobile.replace(/\r/g, '\r\n'), replaceMobile.replace(/\r/g, '\r\n'));
    replaced = true;
    console.log('Mobile button replaced (CRLF).');
}

if (replaced) {
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Materials.jsx successfully updated.');
} else {
    console.log('Could not find search strings. Please check.');
}
