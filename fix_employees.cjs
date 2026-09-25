const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Employees.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add deleteTargetId state
if (!content.includes('deleteTargetId')) {
  content = content.replace(
    /const \[editingId, setEditingId\] = useState\(null\);/,
    `const [editingId, setEditingId] = useState(null);\n  const [deleteTargetId, setDeleteTargetId] = useState(null);`
  );
}

// 2. Replace handleDelete with handleDeleteClick and confirmDelete
const oldDeleteRegex = /const handleDelete = async \([\s\S]*?\}\s*catch[^\}]+\}[\s\n]*\};/;
const newDeleteFuncs = `const handleDeleteClick = (targetId) => {
    // If called without arguments (e.g. from the form), use editingId
    const idToDelete = (targetId && typeof targetId === 'string') ? targetId : editingId;
    if (idToDelete === user.id) {
      alert("You cannot delete your own account!");
      return;
    }
    setDeleteTargetId(idToDelete);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account', { target_user_id: deleteTargetId });
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      
      if (deleteTargetId === editingId) {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormState);
      }
      setDeleteTargetId(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting user:', err.message);
      alert('Error deleting user: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };`;

content = content.replace(oldDeleteRegex, newDeleteFuncs);

// 3. Fix the table row onClick buttons: onClick={() => handleDelete(emp.id, emp.full_name)}
// Need to change to onClick={() => handleDeleteClick(emp.id)}
content = content.replace(/onClick=\{\(\) => handleDelete\(emp\.id, emp\.full_name\)\}/g, 'onClick={() => handleDeleteClick(emp.id)}');

// 4. Update the ConfirmDeleteModal props
// Replace: itemName={employees.find(m => m.id === editingId)?.full_name || 'this record'}
// With: itemName={employees.find(m => m.id === deleteTargetId)?.full_name || 'this record'}
// And onClose={() => setShowDeleteConfirm(false)}
// With onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
content = content.replace(
  /itemName=\{employees\.find\(m => m\.id === editingId\)\?\.full_name \|\| 'this record'\}/g,
  `itemName={employees.find(m => m.id === deleteTargetId)?.full_name || 'this record'}`
);
content = content.replace(
  /onClose=\{\(\) => setShowDeleteConfirm\(false\)\}/g,
  `onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Employees.jsx');
