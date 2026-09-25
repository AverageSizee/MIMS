const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add showAllCategories state
content = content.replace("const [activeSlicer, setActiveSlicer] = useState('All');", `const [activeSlicer, setActiveSlicer] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);`);

// 2. Replace uniqueCategories and add handleAddCategory
content = content.replace("const uniqueCategories = ['All', ...new Set(materials.map(m => m.category).filter(Boolean))];", `const uniqueCategories = ['All', ...categoriesList.map(c => c.name)];
  
  const handleAddCategory = async () => {
    const newCat = window.prompt('Enter new category name:');
    if (!newCat || !newCat.trim()) return;
    try {
      const { error } = await supabase.from('categories').insert({ name: newCat.trim() });
      if (error) {
        if (error.code === '23505') throw new Error('Category already exists.');
        throw error;
      }
      setCategoriesList([...categoriesList, { name: newCat.trim() }].sort((a,b) => a.name.localeCompare(b.name)));
    } catch (err) {
      alert('Failed to add category: ' + err.message);
    }
  };`);

// 3. Replace the slicer UI
const oldUI = `<div className="flex gap-1 flex-wrap">
                  {uniqueCategories.map(cat => (
                     <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1);}} className={\`px-3 py-1 text-xs rounded-full border \${activeSlicer === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}\`}>{cat}</button>
                  ))}
               </div>`;

const newUI = `<div className="flex gap-1 flex-wrap items-center">
                  {(showAllCategories ? uniqueCategories : uniqueCategories.slice(0, 6)).map(cat => (
                     <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1);}} className={\`px-3 py-1 text-xs rounded-full border transition-colors \${activeSlicer === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}\`}>{cat}</button>
                  ))}
                  {uniqueCategories.length > 6 && !showAllCategories && (
                     <button title="Show more categories" onClick={() => setShowAllCategories(true)} className="px-3 py-1 text-xs rounded-full border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200">...</button>
                  )}
                  {uniqueCategories.length > 6 && showAllCategories && (
                     <button title="Show fewer categories" onClick={() => setShowAllCategories(false)} className="px-3 py-1 text-xs rounded-full border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200">↑ Less</button>
                  )}
                  <button title="Add a new category" onClick={handleAddCategory} className="px-3 py-1 text-xs rounded-full border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-bold leading-none">+</button>
               </div>`;

if (!content.includes(oldUI)) {
  console.log("Fallback replacement for UI");
  content = content.replace(/<div className="flex gap-1 flex-wrap">[\s\S]*?<\/div>/, newUI);
} else {
  content = content.replace(oldUI, newUI);
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Materials slicer updated.');
