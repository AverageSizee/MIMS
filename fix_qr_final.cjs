const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Remove the Print QR Labels button (CRLF line endings)
const qrBtnOld = `\r\n        <button\r\n          onClick={() => setShowQRSheet(true)}\r\n          title="Print QR shelf labels for all materials"\r\n          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium"\r\n        >\r\n          \uD83C\uDFF7\uFE0F Print QR Labels\r\n        </button>`;
content = content.replace(qrBtnOld, '');

// 2. Replace showQRSheet state with qrMaterial state
content = content.replace("const [showQRSheet, setShowQRSheet] = useState(false);", "const [qrMaterial, setQrMaterial] = useState(null);");

// 3. Replace QRSheetPrinter import with QRModal
content = content.replace(
  "import QRSheetPrinter from '../components/QRSheetPrinter';",
  "import QRModal from '../components/QRModal';"
);

// 4. Find and update QRSheetPrinter usage to QRModal
content = content.replace(
  /\{showQRSheet[\s\S]*?QRSheetPrinter[\s\S]*?\}\}/,
  `<QRModal isOpen={!!qrMaterial} onClose={() => setQrMaterial(null)} material={qrMaterial} />`
);
// also try direct tag replacement
content = content.replace(
  /<QRSheetPrinter[\s\S]*?\/>/,
  `<QRModal isOpen={!!qrMaterial} onClose={() => setQrMaterial(null)} material={qrMaterial} />`
);

// 5. Add QR icon button in actions td - find the edit pencil button and add QR after it
const pencilBtn = `</svg>\r\n                            </button>\r\n                          </td>\r\n                        </tr>`;
const pencilWithQR = `</svg>\r\n                            </button>\r\n                            <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r\n                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r\n                            </button>\r\n                          </td>\r\n                        </tr>`;
content = content.replace(pencilBtn, pencilWithQR);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done! Removed button, added QR icon in row actions.');
