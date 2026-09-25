const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// Add state for extraWarnings
content = content.replace(
  "const [affectedSuppliers, setAffectedSuppliers] = useState([]);",
  "const [affectedSuppliers, setAffectedSuppliers] = useState([]);\n  const [extraWarnings, setExtraWarnings] = useState([]);"
);

const oldHandleDeleteClick = `const handleDeleteClick = async () => {
    const mat = materials.find(m => m.id === editingId);
    if (!mat) return;
    try {
      const { data: allSuppliers } = await supabase.from('suppliers').select('id, supplier_name, primary_materials_supplied');
      if (allSuppliers) {
        const affected = allSuppliers.filter(s => s.primary_materials_supplied && s.primary_materials_supplied.split(', ').includes(mat.material_description));
        setAffectedSuppliers(affected);
      } else {
        setAffectedSuppliers([]);
      }
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error(error);
      setShowDeleteConfirm(true);
    }
  };`;

const newHandleDeleteClick = `const handleDeleteClick = async () => {
    const mat = materials.find(m => m.id === editingId);
    if (!mat) return;
    try {
      // 1. Check Suppliers
      const { data: allSuppliers } = await supabase.from('suppliers').select('id, supplier_name, primary_materials_supplied');
      if (allSuppliers) {
        const affected = allSuppliers.filter(s => s.primary_materials_supplied && s.primary_materials_supplied.split(', ').includes(mat.material_description));
        setAffectedSuppliers(affected);
      } else {
        setAffectedSuppliers([]);
      }
      
      // 2. Check other tables for references
      let warnings = [];
      const { count: delCount } = await supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('material_id', mat.id);
      if (delCount > 0) warnings.push(\`Deliveries (\${delCount} records)\`);
      
      const { count: issCount } = await supabase.from('issuances').select('id', { count: 'exact', head: true }).eq('material_id', mat.id);
      if (issCount > 0) warnings.push(\`Issuances (\${issCount} records)\`);
      
      const { count: retCount } = await supabase.from('returns').select('id', { count: 'exact', head: true }).eq('material_id', mat.id);
      if (retCount > 0) warnings.push(\`Returns (\${retCount} records)\`);
      
      setExtraWarnings(warnings);
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error(error);
      setShowDeleteConfirm(true);
    }
  };`;

// Let's use regex in case of slight whitespace variations
if (content.includes("const handleDeleteClick = async () => {")) {
   content = content.replace(/const handleDeleteClick = async \(\) => \{[\s\S]*?setShowDeleteConfirm\(true\);\s*\}\s*\};/, newHandleDeleteClick);
}

// Update the JSX to pass extraWarnings to ConfirmDeleteModal
content = content.replace(
  "affectedItems={affectedSuppliers}",
  "affectedItems={affectedSuppliers}\n        extraWarnings={extraWarnings}"
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Patched Materials.jsx delete click');
