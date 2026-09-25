const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Inject new states
content = content.replace("const [showAllCategories, setShowAllCategories] = useState(false);", `const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');`);

// 2. Replace handleAddCategory with submitNewCategory
const oldHandlerRegex = /const handleAddCategory = async \(\) => \{[\s\S]*?alert\('Failed to add category: ' \+ err\.message\);\s*\}\s*\};/g;

const newHandler = `const submitNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase.from('categories').insert({ name: newCategoryName.trim() });
      if (error) {
        if (error.code === '23505') throw new Error('Category already exists.');
        throw error;
      }
      setCategoriesList([...categoriesList, { name: newCategoryName.trim() }].sort((a,b) => a.name.localeCompare(b.name)));
      setShowAddCategoryModal(false);
      setNewCategoryName('');
    } catch (err) {
      alert('Failed to add category: ' + err.message);
    }
  };`;

content = content.replace(oldHandlerRegex, newHandler);

// 3. Replace Slicer UI
const oldUI = `<div className="flex gap-1 flex-wrap items-center">`;
const newUI = `<div className="flex gap-1 flex-wrap items-center">
                  {uniqueCategories.slice(0, 6).map(cat => (
                     <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1);}} className={\`px-3 py-1 text-xs rounded-full border transition-colors \${activeSlicer === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}\`}>{cat}</button>
                  ))}
                  
                  {uniqueCategories.length > 6 && (
                     <div className="relative">
                       <button title="Show more categories" onClick={() => setShowMoreMenu(!showMoreMenu)} className="px-3 py-1 flex items-center justify-center text-xs rounded-full border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                         </svg>
                       </button>
                       {showMoreMenu && (
                         <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50 min-w-max flex flex-col">
                           {uniqueCategories.slice(6).map(cat => (
                             <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1); setShowMoreMenu(false);}} className={\`px-4 py-2 text-left text-sm hover:bg-gray-50 \${activeSlicer === cat ? 'font-bold text-blue-600' : 'text-gray-700'}\`}>
                               {cat}
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                  )}
                  <button title="Add a new category" onClick={() => setShowAddCategoryModal(true)} className="px-3 py-1 flex items-center justify-center text-xs rounded-full border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-bold leading-none h-6 w-8">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </button>
               </div>`;

content = content.replace(/<div className="flex gap-1 flex-wrap items-center">[\s\S]*?<\/div>/, newUI);

// 4. Inject Modal before final </div>
const endDivRegex = /<\/div>\s*$/;
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
  </div>`;
content = content.replace(endDivRegex, modalUI);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Materials more menu and modal updated.');
