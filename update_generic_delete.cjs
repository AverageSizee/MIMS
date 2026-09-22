const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = [
  { file: 'Suppliers.jsx', table: 'suppliers', fetchFunc: 'fetchData', nameField: 'name', varList: 'suppliers' },
  { file: 'Deliveries.jsx', table: 'deliveries', fetchFunc: 'fetchDeliveries', nameField: 'delivery_id', varList: 'deliveries' },
  { file: 'Issuances.jsx', table: 'issuances', fetchFunc: 'fetchIssuances', nameField: 'issuance_id', varList: 'issuances' },
  { file: 'Returns.jsx', table: 'returns', fetchFunc: 'fetchReturns', nameField: 'return_id', varList: 'returns' },
  { file: 'Employees.jsx', table: 'employees', fetchFunc: 'fetchEmployees', nameField: 'full_name', varList: 'employees' }
];

for (const p of pages) {
  const filePath = path.join(pagesDir, p.file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already updated
  if (content.includes('import ConfirmDeleteModal')) continue;

  content = content.replace(
    /import Modal from '\.\.\/components\/Modal';/,
    `import Modal from '../components/Modal';\nimport ConfirmDeleteModal from '../components/ConfirmDeleteModal';`
  );

  content = content.replace(
    /const \[submitting, setSubmitting\] = useState\(false\);/,
    `const [submitting, setSubmitting] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [isDeleting, setIsDeleting] = useState(false);`
  );

  const oldDeleteRegex = /const handleDelete = async \(\) => \{[\s\S]*?\};\s*return \(/;
  const newDeleteFuncs = `const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('${p.table}').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      ${p.fetchFunc}();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (`;
  
  content = content.replace(oldDeleteRegex, newDeleteFuncs);

  content = content.replace(/onClick=\{handleDelete\}/g, 'onClick={handleDeleteClick}');

  const modalJsx = `
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={${p.varList}.find(m => m.id === editingId)?.${p.nameField} || 'this record'}
        isDeleting={isDeleting}
      />
    </div>
  );
}`;
  content = content.replace(/<\/div>\s*\);\s*\}\s*$/m, modalJsx);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', p.file, 'for generic delete modal.');
}
