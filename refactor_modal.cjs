const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

const oldModalRegex = /\{showAddCategoryModal && \([\s\S]*?<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">[\s\S]*?<\/div>\s*\)\}/;

const newModal = `
      <Modal isOpen={showAddCategoryModal} onClose={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }} title="Add New Category">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" autoFocus value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. Excavation" />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              Cancel
            </button>
            <button onClick={submitNewCategory} disabled={!newCategoryName.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors disabled:opacity-50">
              Save Category
            </button>
          </div>
        </div>
      </Modal>
`;

if (!oldModalRegex.test(content)) {
  console.log("Could not find old modal.");
} else {
  content = content.replace(oldModalRegex, newModal);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log("Modal updated successfully!");
}
