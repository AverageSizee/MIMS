const fs = require('fs');
const path = require('path');

function replaceFile(filename) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Find the useState for visibleColumns
  content = content.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(\[.*?\]\);/, "const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at'].includes(id)));");

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Updated ${filename}`);
}

['Materials.jsx', 'Suppliers.jsx', 'Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(replaceFile);
