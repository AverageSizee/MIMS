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

  // Look for:
  // <div className="md:col-span-2 flex justify-end mt-(some number)">
  //   <button disabled={submitting} type="submit" className="(something)">
  //     {submitting ? ... : (editingId ? '(EditLabel)' : '(AddLabel)')}
  //   </button>
  // </div>
  const buttonWrapperRegex = /<div className="md:col-span-2 flex justify-end mt-\d+">\s*<button disabled=\{submitting\} type="submit" className="bg-blue-600([^>]+)>\s*\{submitting \? <Loader2 className="w-4 h-4 mr-2 animate-spin" \/> : \(editingId \? '([^']+)' : '([^']+)'\)\}\s*<\/button>\s*<\/div>/;

  const match = content.match(buttonWrapperRegex);
  if (match) {
    const classNames = match[1];
    const editLabel = match[2];
    const addLabel = match[3];
    
    const newButtons = `<div className="md:col-span-2 flex justify-between mt-4 border-t pt-4">
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
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated", file);
  }
}
