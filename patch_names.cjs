const fs = require('fs');
const path = require('path');

function replaceFile(filename, replacements) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Updated ${filename}`);
}

replaceFile('Deliveries.jsx', [
  ['d.materials?.name', 'd.materials?.material_description'],
  ['d.suppliers?.name', 'd.suppliers?.supplier_name']
]);

replaceFile('Issuances.jsx', [
  ['i.materials?.name', 'i.materials?.material_description']
]);

replaceFile('Returns.jsx', [
  ['r.materials?.name', 'r.materials?.material_description']
]);

replaceFile('Suppliers.jsx', [
  ['?.name', '?.supplier_name']
]);

console.log('All .name references patched.');
