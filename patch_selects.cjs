const fs = require('fs');
const path = require('path');

function replaceFile(filename, replacements) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [find, replace] of replacements) {
    // using split join to replace all occurrences
    content = content.split(find).join(replace);
  }
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Updated ${filename}`);
}

replaceFile('Deliveries.jsx', [
  ['materials(name)', 'materials(material_description)'],
  ['suppliers(name)', 'suppliers(supplier_name)'],
  ["select('id, name, unit_cost')", "select('id, material_description, unit_cost')"],
  ["select('id, name')", "select('id, supplier_name')"]
]);

replaceFile('Issuances.jsx', [
  ['materials(name)', 'materials(material_description)'],
  ["select('id, name, unit_cost')", "select('id, material_description, unit_cost')"]
]);

replaceFile('Returns.jsx', [
  ['materials(name)', 'materials(material_description)'],
  ["select('id, name, unit_cost')", "select('id, material_description, unit_cost')"]
]);

replaceFile('Suppliers.jsx', [
  ["select('name')", "select('material_description')"],
  [".order('name')", ".order('material_description')"]
]);

replaceFile('Materials.jsx', [
  ["select('id, name, materials_supplied')", "select('id, supplier_name, primary_materials_supplied')"]
]);

console.log('All select queries patched.');
