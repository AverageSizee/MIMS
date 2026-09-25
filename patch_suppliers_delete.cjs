const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Suppliers.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// Add state for extraWarnings
content = content.replace(
  "const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
  "const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [extraWarnings, setExtraWarnings] = useState([]);"
);

const newHandleDeleteClick = `const handleDeleteClick = async () => {
    try {
      let warnings = [];
      const { count: delCount } = await supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('supplier_id', editingId);
      if (delCount > 0) warnings.push(\`Deliveries (\${delCount} records)\`);
      
      setExtraWarnings(warnings);
    } catch (err) {
      console.error(err);
    }
    setShowDeleteConfirm(true);
  };`;

content = content.replace(/const handleDeleteClick = \(\) => \{\s*setShowDeleteConfirm\(true\);\s*\};/, newHandleDeleteClick);

content = content.replace(
  "itemName={suppliers.find(m => m.id === editingId)?.supplier_name || 'this record'}",
  "itemName={suppliers.find(m => m.id === editingId)?.supplier_name || 'this record'}\n        extraWarnings={extraWarnings}"
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Patched Suppliers.jsx delete click');
