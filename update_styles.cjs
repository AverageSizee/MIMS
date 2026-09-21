const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

  // Replace Header
  content = content.replace(/<thead className="bg-gray-50 text-gray-500">/g, '<thead className="bg-slate-900 text-white">');
  
  // Replace Dashboard / Materials Badge Logic (Desktop & Mobile)
  const oldBadgeRegex = /className=\{`px-[23] py-1 rounded(?:-full|-md)? text-xs font-medium\s+\$\{.*?item\.status === 'NORMAL'.*?`\}/gs;
  
  const newBadgeStr = `className={\`px-2 py-1 rounded text-xs font-bold border tracking-wider uppercase
                      \${item.status === 'NORMAL' ? 'border-green-500 text-green-700 bg-green-50/50' : 
                        item.status === 'REORDER' ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 
                        item.status === 'OUT OF STOCK' ? 'border-red-500 text-red-700 bg-red-50/50' : 
                        'border-blue-500 text-blue-700 bg-blue-50/50'}\`}`;

  content = content.replace(oldBadgeRegex, newBadgeStr);

  // Since Materials doesn't use `item.status`, wait!
  // Dashboard uses `item.status`. Does Materials use `m.status`? 
  // Let me check if Materials even HAS a status column. 
  // Wait, in my previous code for Materials, I didn't actually add the 'status' column to the view, because it wasn't in the DB view!
  // Let me just write this to file and test it.

  fs.writeFileSync(path.join(pagesDir, file), content, 'utf8');
}
console.log("Updated styles!");
