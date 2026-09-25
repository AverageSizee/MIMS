const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/await supabase[\s\n]*\.from\('materials'\)[\s\n]*\.select\('id, supplier_name, primary_materials_supplied'\)[\s\n]*\.order\('created_at', \{ ascending: false \}\);/g, "await supabase.from('materials').select('*').order('created_at', { ascending: false });");

// The actual fetch query:
c = c.replace(/\.from\('materials'\)[\s\n]*\.select\('\*, creator:profiles!materials_created_by_fkey\(full_name\), updater:profiles!materials_updated_by_fkey\(full_name\)'\)[\s\n]*\.order\('created_at', \{ ascending: false \}\)/g, ".from('inventory_dashboard').select('*').order('material_description')");

// In case the above didn't match perfectly, let's just use string replace carefully
c = c.replace(/from\('materials'\)\s*\.select\('\*, creator:profiles!materials_created_by_fkey\(full_name\), updater:profiles!materials_updated_by_fkey\(full_name\)'\)/g, "from('inventory_dashboard').select('*')");

fs.writeFileSync(file, c, 'utf8');
console.log('Materials.jsx fetch logic patched');
