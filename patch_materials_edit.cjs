const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/const handleEdit = \(material\) => \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\};/, `const handleEdit = (material) => {
    setFormData({
      material_description: material.material_description || '',
      category: material.category || '',
      unit: material.unit || '',
      unit_cost: material.unit_cost || '',
      reorder_level: material.reorder_level || '',
      target_level: material.target_level || ''
    });
    setEditingId(material.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Materials handleEdit patched.');
