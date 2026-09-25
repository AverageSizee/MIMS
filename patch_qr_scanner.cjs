const fs = require('fs');
const path = require('path');

function patchPage(filename, materialDropdownLabel, materialFieldName) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Import QRScanner
  content = content.replace(
    "import Modal from '../components/Modal';",
    "import Modal from '../components/Modal';\nimport QRScanner from '../components/QRScanner';"
  );

  // 2. Add state
  content = content.replace(
    "const [showForm, setShowForm] = useState(false);",
    "const [showForm, setShowForm] = useState(false);\n  const [showQRScanner, setShowQRScanner] = useState(false);"
  );

  // 3. Add handler after handleInputChange
  const handlerAnchor = "const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });";
  const qrHandler = `
  const handleQRScanned = (materialId) => {
    const found = materials.find(m => m.material_id === materialId);
    if (found) {
      setFormData(prev => ({ ...prev, ${materialFieldName}: found.id }));
    } else {
      alert('Material "' + materialId + '" not found in the database.');
    }
  };
`;
  content = content.replace(handlerAnchor, handlerAnchor + qrHandler);

  // 4. Add scan button next to Material dropdown label
  const labelAnchor = `<label className="block text-sm font-medium text-gray-700 mb-1">${materialDropdownLabel}</label>`;
  const newLabel = `<div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">${materialDropdownLabel}</label>
                <button type="button" onClick={() => setShowQRScanner(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  📷 Scan QR
                </button>
              </div>`;
  content = content.replace(labelAnchor, newLabel);

  // 5. Add QRScanner component just before the closing </div>); }
  const endTag = /(<\/div>\s*\);\s*\}\s*)$/;
  content = content.replace(endTag, `
    <QRScanner
      isOpen={showQRScanner}
      onClose={() => setShowQRScanner(false)}
      onScanned={handleQRScanned}
    />
$1`);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`${filename} patched with QR scanner`);
}

patchPage('Deliveries.jsx', 'Material', 'material_id');
patchPage('Issuances.jsx', 'Material', 'material_id');
