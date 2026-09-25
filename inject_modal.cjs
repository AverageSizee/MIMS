const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

const endDivRegex = /<\/div>\s*\);\s*\}/;

const modalUI = `
    {showAddCategoryModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Add New Category</h3>
            <button onClick={() => {setShowAddCategoryModal(false); setNewCategoryName('');}} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" autoFocus value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. Excavation" />
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
            <button onClick={() => {setShowAddCategoryModal(false); setNewCategoryName('');}} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={submitNewCategory} disabled={!newCategoryName.trim()} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">Save Category</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}`;

if (!endDivRegex.test(content)) {
  console.log("Could not find end of component.");
} else {
  content = content.replace(endDivRegex, modalUI);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log("Modal injected successfully!");
}
