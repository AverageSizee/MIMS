const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Order by created_at DESC
content = content.replace(/\.order\('material_description'\)/, ".order('created_at', { ascending: false })");

// 2. Inject states
const stateAnchor = "const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at'].includes(id)));";
if (!content.includes(stateAnchor)) console.error('Anchor not found for states');
content = content.replace(stateAnchor, `${stateAnchor}
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlicer, setActiveSlicer] = useState('All');
`);

// 3. Inject filter/pagination logic before return
const returnAnchor = "return (<div className=\"space-y-6\">";
if (!content.includes(returnAnchor)) console.error('Anchor not found for return');
content = content.replace(returnAnchor, `
  // Filtering & Pagination Logic
  const itemsPerPage = 20;
  
  const uniqueCategories = ['All', ...new Set(materials.map(m => m.category).filter(Boolean))];
  
  const filteredData = materials.filter(m => {
    const matchesSearch = Object.values(m).some(val => 
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSlicer = activeSlicer === 'All' || m.category === activeSlicer;
    return matchesSearch && matchesSlicer;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  ${returnAnchor}`);

// 4. Inject Search/Slicer UI in table header
const headerAnchor = `<div className="flex justify-end p-2 border-b border-gray-50">`;
if (!content.includes(headerAnchor)) console.error('Anchor not found for header');
content = content.replace(headerAnchor, `<div className="flex justify-between p-2 border-b border-gray-50 items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
               <input type="text" placeholder="Search materials..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-md p-1.5 text-sm w-64" />
               <div className="flex gap-1 flex-wrap">
                  {uniqueCategories.map(cat => (
                     <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1);}} className={\`px-3 py-1 text-xs rounded-full border \${activeSlicer === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}\`}>{cat}</button>
                  ))}
               </div>
            </div>`);

// 5. Replace materials.map with paginatedData.map in both desktop and mobile views
content = content.replace(/\{materials\.map\(\(m\) => \(/g, '{paginatedData.map((m) => (');

// 6. Inject Pagination UI after tbody and mobile list
const tbodyEnd = "</tbody>";
content = content.replace(tbodyEnd, `${tbodyEnd}
                    {totalPages > 1 && (
                      <tfoot>
                        <tr>
                          <td colSpan="100%">
                            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-50">
                              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Prev</button>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={\`px-3 py-1 rounded border text-sm \${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'}\`}>{page}</button>
                              ))}
                              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Next</button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    )}`);

const mobileEndAnchor = `<div className="p-6 text-center text-gray-500">No materials recorded yet.</div>`;
content = content.replace(mobileEndAnchor, `${mobileEndAnchor}
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-50">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={\`px-3 py-1 rounded border text-sm \${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'}\`}>{page}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Next</button>
                  </div>`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Materials updated for Table Controls.');
