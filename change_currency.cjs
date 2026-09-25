const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const peso = '\u20B1'; // Peso sign ₱

const filesToUpdate = [
  'Dashboard.jsx',
  'Deliveries.jsx',
  'Issuances.jsx',
  'Materials.jsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // For Dashboard.jsx, fix the mangled encoding
  if (file === 'Dashboard.jsx') {
    content = content.replace(/label: `[^$]*?\$\{\(catMap\[c\] \/ 1000\)\.toFixed\(1\)\}K`/g, 'label: `'+peso+'${(catMap[c] / 1000).toFixed(1)}K`');
    content = content.replace(/<Tooltip formatter=\{\(value\) => `[^$]*?\$\{value\.toLocaleString\(\)\}`\} \/>/g, '<Tooltip formatter={(value) => `'+peso+'${value.toLocaleString()}`} />');
  }

  // Replace standard dollar signs in text
  // Looking for: ">$" or "font-medium">$" or text-gray-800">$"
  // The simplest is to replace `>$` with `>${peso}` but let's be more precise.
  content = content.replace(/>\$/g, `>${peso}`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated currency in', file);
}
