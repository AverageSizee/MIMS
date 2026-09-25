const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Replace QRSheetPrinter import with QRModal
content = content.replace(
  "import QRSheetPrinter from '../components/QRSheetPrinter';",
  "import QRModal from '../components/QRModal';"
);

// 2. Replace state
content = content.replace(
  "const [showQRSheet, setShowQRSheet] = useState(false);",
  "const [qrMaterial, setQrMaterial] = useState(null);"
);

// 3. Replace the Print QR Labels button with nothing (remove it from header)
content = content.replace(
  `        <button\n          onClick={() => setShowQRSheet(true)}\n          title="Print QR shelf labels for all materials"\n          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium"\n        >\n          🏷️ Print QR Labels\n        </button>`,
  ''
);

// 4. Add QR icon button in the table Actions td (after the edit button)
const editBtn = `<button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                          </td>`;

const editBtnWithQR = `<button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" /></svg>
                            </button>
                          </td>`;

content = content.replace(editBtn, editBtnWithQR);

// 5. Replace QRSheetPrinter usage with QRModal
content = content.replace(
  `{showQRSheet && (\n      <QRSheetPrinter\n        materials={materials}\n        onClose={() => setShowQRSheet(false)}\n      />\n    )}`,
  `<QRModal\n      isOpen={!!qrMaterial}\n      onClose={() => setQrMaterial(null)}\n      material={qrMaterial}\n    />`
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('QR modal wired into Materials actions!');
