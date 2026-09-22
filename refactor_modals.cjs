const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = [
  'Materials.jsx',
  'Suppliers.jsx',
  'Deliveries.jsx',
  'Issuances.jsx',
  'Returns.jsx',
  'Employees.jsx'
];

for (const file of pages) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Modal import
  if (!content.includes("import Modal from '../components/Modal'")) {
    content = content.replace(/(import.*';\n)/, "$1import Modal from '../components/Modal';\n");
  }

  // Remove the old 'Add' toggle button from the header (we'll replace its action to just open modal)
  // Actually, keep the toggle button, it's fine. It sets showForm(!showForm). Let's keep it.

  // The form block starts at `{showForm && (\n        <form onSubmit={handleSubmit}`
  // Let's replace `{showForm && (` with `<Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? 'Edit Record' : 'Add New Record'}>`
  const formStartRegex = /\{showForm && \(\s*<form([^>]+)>/;
  const matchForm = content.match(formStartRegex);
  if (matchForm) {
    const formTagAttrs = matchForm[1].replace(/className="[^"]+"/, 'className="grid grid-cols-1 md:grid-cols-2 gap-4"'); // Standardize form grid
    
    // Replace start
    content = content.replace(formStartRegex, 
      `<Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? 'Edit Record' : 'Add New Record'}>\n        <form${formTagAttrs}>`
    );

    // Remove the old title block inside the form:
    // <div className="md:col-span-2 border-b pb-2 mb-2"> ... </div>
    // or similar
    content = content.replace(/<div className="md:col-span-2[^>]*border-b[^>]*>[\s\S]*?<\/div>\s*(<div>\s*<label)/m, '$1');

    // Replace the bottom buttons
    const btnRegex = /<div className="md:col-span-2 flex justify-between[^>]*>[\s\S]*?<\/form>\s*\)/;
    const btnMatch = content.match(btnRegex);
    if (btnMatch) {
      // Find the labels
      const submitMatches = btnMatch[0].match(/editingId \? '([^']+)' : '([^']+)'/);
      const editLabel = submitMatches ? submitMatches[1] : 'Update';
      const addLabel = submitMatches ? submitMatches[2] : 'Save';

      const newButtons = `<div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              Cancel
            </button>
            {editingId && (
              <button type="button" onClick={handleDelete} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center transition-colors font-medium text-sm">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            )}
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? '${editLabel}' : '${addLabel}')}
            </button>
          </div>
        </form>
      </Modal>`;

      content = content.replace(btnRegex, newButtons);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated", file);
}
