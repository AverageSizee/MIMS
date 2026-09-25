const fs = require('fs');
const path = require('path');

// ---- MATERIALS: Add Print QR Sheet button ----
const matFile = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let mat = fs.readFileSync(matFile, 'utf8');

// Import
mat = mat.replace(
  "import ColumnToggle from '../components/ColumnToggle';",
  "import ColumnToggle from '../components/ColumnToggle';\nimport QRSheetPrinter from '../components/QRSheetPrinter';"
);

// State
mat = mat.replace(
  "const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);",
  "const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);\n  const [showQRSheet, setShowQRSheet] = useState(false);"
);

// Button next to Add Material
mat = mat.replace(
  `className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Material'}
          </button>`,
  `className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Material'}
          </button>
          <button
            onClick={() => setShowQRSheet(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900 transition-colors text-sm font-medium"
            title="Print QR shelf labels for all materials"
          >
            🏷️ Print QR Labels
          </button>`
);

// QRSheetPrinter component before last </div>
const endTag = /(<\/div>\s*\);\s*\}\s*)$/;
mat = mat.replace(endTag, `
    {showQRSheet && (
      <QRSheetPrinter
        materials={materials}
        onClose={() => setShowQRSheet(false)}
      />
    )}
$1`);

fs.writeFileSync(matFile, mat, 'utf8');
console.log('Materials patched with QR Sheet printer');
