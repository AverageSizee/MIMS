const fs = require('fs');

let content = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');

// 1. Add imports
const importTarget = `import { Plus, Loader2, Edit2, Trash2, MapPin } from 'lucide-react';`;
const newImport = `import { Plus, Loader2, Edit2, Trash2, MapPin } from 'lucide-react';\nimport SupplierQRModal from '../components/SupplierQRModal';`;
if (content.includes(importTarget)) {
    content = content.replace(importTarget, newImport);
}

// 2. Add state
const stateTarget = `const [editingId, setEditingId] = useState(null);`;
const newState = `const [editingId, setEditingId] = useState(null);\n  const [qrSupplier, setQrSupplier] = useState(null);`;
if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, newState);
}

// 3. Add desktop QR button
const desktopBtnOld = `<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>\r
                            </button>`;
const desktopBtnNew = `<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>\r
                            </button>\r
                            <button onClick={() => setQrSupplier(s)} title="View QR Codes" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                            </button>`;

if (content.includes(desktopBtnOld.replace(/\r/g, ''))) {
    content = content.replace(desktopBtnOld.replace(/\r/g, ''), desktopBtnNew.replace(/\r/g, ''));
} else if (content.includes(desktopBtnOld.replace(/\r/g, '\r\n'))) {
    content = content.replace(desktopBtnOld.replace(/\r/g, '\r\n'), desktopBtnNew.replace(/\r/g, '\r\n'));
}

// 4. Add mobile QR button
const mobileBtnOld = `<Edit2 className="w-4 h-4" />\r
                      </button>`;
const mobileBtnNew = `<Edit2 className="w-4 h-4" />\r
                      </button>\r
                      <button onClick={() => setQrSupplier(s)} className="p-2 text-purple-600 bg-purple-50 rounded-lg shrink-0 ml-2">\r
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r
                      </button>`;

if (content.includes(mobileBtnOld.replace(/\r/g, ''))) {
    content = content.replace(mobileBtnOld.replace(/\r/g, ''), mobileBtnNew.replace(/\r/g, ''));
} else if (content.includes(mobileBtnOld.replace(/\r/g, '\r\n'))) {
    content = content.replace(mobileBtnOld.replace(/\r/g, '\r\n'), mobileBtnNew.replace(/\r/g, '\r\n'));
}

// 5. Add Modal rendering
const modalTarget = `</div>\r
    </div>\r
  );\r
}`;
const modalNew = `</div>\r
      <SupplierQRModal isOpen={!!qrSupplier} onClose={() => setQrSupplier(null)} supplier={qrSupplier} />\r
    </div>\r
  );\r
}`;

if (content.includes(modalTarget.replace(/\r/g, ''))) {
    content = content.replace(modalTarget.replace(/\r/g, ''), modalNew.replace(/\r/g, ''));
} else if (content.includes(modalTarget.replace(/\r/g, '\r\n'))) {
    content = content.replace(modalTarget.replace(/\r/g, '\r\n'), modalNew.replace(/\r/g, '\r\n'));
}

fs.writeFileSync('src/pages/Suppliers.jsx', content, 'utf8');
console.log('Suppliers.jsx patched!');
