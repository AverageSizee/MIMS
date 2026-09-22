const fs = require('fs');
const path = require('path');

const materialsPath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(materialsPath, 'utf8');

if (!content.includes('import ConfirmDeleteModal')) {
  content = content.replace(
    /import Modal from '\.\.\/components\/Modal';/,
    `import Modal from '../components/Modal';\nimport ConfirmDeleteModal from '../components/ConfirmDeleteModal';`
  );
}

// Add state variables
if (!content.includes('showDeleteConfirm')) {
  content = content.replace(
    /const \[submitting, setSubmitting\] = useState\(false\);/,
    `const [submitting, setSubmitting] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [affectedSuppliers, setAffectedSuppliers] = useState([]);\n  const [isDeleting, setIsDeleting] = useState(false);`
  );
}

// Replace old handleDelete with handleDeleteClick and confirmDelete
const oldDeleteRegex = /const handleDelete = async \(\) => \{[\s\S]*?\};\s*return \(/;
const newDeleteFuncs = `const handleDeleteClick = async () => {
    const mat = materials.find(m => m.id === editingId);
    if (!mat) return;
    try {
      const { data: allSuppliers } = await supabase.from('suppliers').select('id, name, materials_supplied');
      if (allSuppliers) {
        const affected = allSuppliers.filter(s => s.materials_supplied && s.materials_supplied.split(', ').includes(mat.name));
        setAffectedSuppliers(affected);
      } else {
        setAffectedSuppliers([]);
      }
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error(error);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const mat = materials.find(m => m.id === editingId);
      if (mat) {
        for (const supp of affectedSuppliers) {
          const newMats = supp.materials_supplied.split(', ').filter(m => m !== mat.name).join(', ');
          await supabase.from('suppliers').update({ materials_supplied: newMats }).eq('id', supp.id);
        }
      }

      const { error } = await supabase.from('materials').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchMaterials();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (`;
content = content.replace(oldDeleteRegex, newDeleteFuncs);

// Change the button onClick
content = content.replace(/onClick=\{handleDelete\}/g, 'onClick={handleDeleteClick}');

// Add the modal JSX before the final closing div
const modalJsx = `
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={materials.find(m => m.id === editingId)?.name || 'this material'}
        affectedItems={affectedSuppliers}
        isDeleting={isDeleting}
      />
    </div>
  );
}`;
content = content.replace(/<\/div>\s*\);\s*\}\s*$/m, modalJsx);

fs.writeFileSync(materialsPath, content, 'utf8');
console.log('Materials.jsx updated for cascade delete.');
