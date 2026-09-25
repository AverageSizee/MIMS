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

// Simplify queries to remove profiles joining which causes FK naming crashes when tables are recreated.
replaceFile('Deliveries.jsx', [
  ["select('*, materials(material_description), suppliers(supplier_name), creator:profiles!deliveries_created_by_fkey(full_name), updater:profiles!deliveries_updated_by_fkey(full_name)')", "select('*, materials(material_description), suppliers(supplier_name)')"]
]);

replaceFile('Issuances.jsx', [
  ["select('*, materials(material_description), creator:profiles!issuances_created_by_fkey(full_name), updater:profiles!issuances_updated_by_fkey(full_name)')", "select('*, materials(material_description)')"]
]);

replaceFile('Returns.jsx', [
  ["select('*, materials(material_description), creator:profiles!returns_created_by_fkey(full_name), updater:profiles!returns_updated_by_fkey(full_name)')", "select('*, materials(material_description)')"]
]);

replaceFile('Suppliers.jsx', [
  ["select(`*, creator:created_by(full_name), updater:updated_by(full_name)`)", "select('*')"],
  ["select('*, creator:created_by(full_name), updater:updated_by(full_name)')", "select('*')"],
  ["map(m => m.name)", "map(m => m.material_description)"],
  ["m.name === matName", "m.material_description === matName"],
  ["setAvailableMaterials((matRes.data || []).map(m => m.name))", "setAvailableMaterials((matRes.data || []).map(m => m.material_description))"]
]);

// Since the components were checking d.creator?.full_name, it will just safely evaluate to undefined and render the fallback ('System' or '-').

console.log('Queries simplified!');
