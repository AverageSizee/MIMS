const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = [
  { file: 'Materials.jsx', table: 'materials', fetchFunc: 'fetchMaterials' },
  { file: 'Suppliers.jsx', table: 'suppliers', fetchFunc: 'fetchData' },
  { file: 'Deliveries.jsx', table: 'deliveries', fetchFunc: 'fetchDeliveries' },
  { file: 'Issuances.jsx', table: 'issuances', fetchFunc: 'fetchIssuances' },
  { file: 'Returns.jsx', table: 'returns', fetchFunc: 'fetchReturns' },
  { file: 'Employees.jsx', table: 'employees', fetchFunc: 'fetchEmployees' }
];

for (const p of pages) {
  const filePath = path.join(pagesDir, p.file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Trash2 to lucide-react imports if not there
  if (content.includes('lucide-react') && !content.includes('Trash2')) {
    content = content.replace(/(import {.*)(} from 'lucide-react';)/, '$1, Trash2 $2');
  } else if (!content.includes('Trash2')) {
    content = `import { Trash2 } from 'lucide-react';\n` + content;
  }

  // Inject handleDelete before return (
  const deleteFunc = `
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('${p.table}').delete().eq('id', editingId);
      if (error) throw error;
      setShowForm(false);
      setEditingId(null);
      ${p.fetchFunc}();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    }
  };

  return (`;
  
  // Only add if not already added
  if (!content.includes('const handleDelete')) {
    content = content.replace(/return\s*\(\s*<div/m, deleteFunc + '<div');
  }

  // Replace form buttons wrapper. Look for:
  // <div className="md:col-span-2 flex justify-end mt-2">
  // <button disabled={submitting}...
  const buttonWrapperRegex = /<div className="md:col-span-2 flex justify-end mt-2">\s*<button disabled=\{submitting\} type="submit" className="bg-blue-600([^>]+)>\s*\{submitting \? <Loader2 className="w-4 h-4 mr-2 animate-spin" \/> : \(editingId \? '([^']+)' : '([^']+)'\)\}\s*<\/button>\s*<\/div>/;
  
  const match = content.match(buttonWrapperRegex);
  if (match) {
    const classNames = match[1];
    const editLabel = match[2];
    const addLabel = match[3];
    
    const newButtons = `<div className="md:col-span-2 flex justify-between mt-2">
            {editingId ? (
              <button type="button" onClick={handleDelete} className="text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-lg flex items-center transition-colors">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            ) : <div></div>}
            <button disabled={submitting} type="submit" className="bg-blue-600${classNames}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? '${editLabel}' : '${addLabel}')}
            </button>
          </div>`;
          
    content = content.replace(buttonWrapperRegex, newButtons);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Delete feature injected.");
