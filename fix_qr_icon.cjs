const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// The exact closing sequence of the edit button in the actions td
const oldActions = `</svg>\r\n                          </button>\r\n                        </td>\r\n                      </tr>`;
const newActions = `</svg>\r\n                          </button>\r\n                          <button onClick={() => setQrMaterial(m)} title="View QR Code" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">\r\n                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>\r\n                          </button>\r\n                        </td>\r\n                      </tr>`;

if (content.includes(oldActions)) {
  content = content.replace(oldActions, newActions);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('QR icon added to actions column!');
} else {
  // Show what we DO have near the closing button
  const idx = content.indexOf('</button>\r\n                        </td>\r\n                      </tr>');
  console.log('Found at:', idx);
  if (idx !== -1) {
    console.log(JSON.stringify(content.substring(idx-100, idx+100)));
  }
}

// Also ensure state is correctly set up
if (!content.includes("const [qrMaterial, setQrMaterial] = useState(null);")) {
  content = content.replace(
    "const [showQRSheet, setShowQRSheet] = useState(false);",
    "const [qrMaterial, setQrMaterial] = useState(null);"
  );
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('State fixed too');
}
