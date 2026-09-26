const fs = require('fs');

// 1. Clean up Layout.jsx
let layout = fs.readFileSync('src/components/Layout.jsx', 'utf8');
layout = layout.replace(/\{\s*name:\s*'Scan QR',\s*href:\s*'\/scan',\s*icon:\s*ScanLine\s*\},\r?\n\s*/, '');
fs.writeFileSync('src/components/Layout.jsx', layout, 'utf8');

// 2. Clean up App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(/<Route path="scan" element=\{<Suspense[^>]+><Scan \/><\/Suspense>\} \/>\r?\n\s*/, '');
fs.writeFileSync('src/App.jsx', app, 'utf8');

// 3. Remove QR icon and conditional rendering from Materials.jsx
let materials = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const qrBtnRegex = /\{m\.has_supplier && \(\s*<button onClick=\{\(\) => setQrMaterial\(m\)\} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\s*<svg className="w-4 h-4" xmlns="http:\/\/www\.w3\.org\/2000\/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"\/><rect x="14" y="3" width="7" height="7" rx="1"\/><rect x="3" y="14" width="7" height="7" rx="1"\/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h\.01"\/><\/svg>\s*<\/button>\s*\)\}/g;
materials = materials.replace(qrBtnRegex, '');

const qrBtnMobileRegex = /\{m\.has_supplier && \(\s*<button onClick=\{\(\) => setQrMaterial\(m\)\} className="p-2 text-purple-600 bg-purple-50 rounded-lg ml-2">\s*<svg className="w-4 h-4" xmlns="http:\/\/www\.w3\.org\/2000\/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"\/><rect x="14" y="3" width="7" height="7" rx="1"\/><rect x="3" y="14" width="7" height="7" rx="1"\/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h\.01"\/><\/svg>\s*<\/button>\s*\)\}/g;
materials = materials.replace(qrBtnMobileRegex, '');

fs.writeFileSync('src/pages/Materials.jsx', materials, 'utf8');

console.log('Cleanup completed successfully!');
