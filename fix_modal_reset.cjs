const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

// Handle Suppliers.jsx specifically first to add initialFormState
const suppliersPath = path.join(pagesDir, 'Suppliers.jsx');
let suppliersContent = fs.readFileSync(suppliersPath, 'utf8');
if (!suppliersContent.includes('const initialFormState = {')) {
  suppliersContent = suppliersContent.replace(
    /const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/,
    `const initialFormState = { name: '', contact_person: '', contact_information: '', address: '', materials_supplied: '' };\n  const [formData, setFormData] = useState(initialFormState);`
  );
  // Replace all other manual resets
  suppliersContent = suppliersContent.replace(/setFormData\(\{ ?name: '', contact_person: '', contact_information: '', address: '', materials_supplied: '' ?\}\)/g, 'setFormData(initialFormState)');
  fs.writeFileSync(suppliersPath, suppliersContent, 'utf8');
}

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

  // Fix the "else" branch of the Add toggle button
  // Look for:
  // } else {
  //   setShowForm(true);
  // }
  // Replace with:
  // } else {
  //   setFormData(initialFormState);
  //   setShowForm(true);
  // }
  content = content.replace(/\} else \{\s*setShowForm\(true\);\s*\}/g, '} else {\n              setFormData(initialFormState);\n              setShowForm(true);\n            }');

  // Also fix Suppliers inline button (which doesn't use the if/else structure but rather onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(initialFormState); }})
  // Actually, for Suppliers, if it's already clearing data on toggle, wait! If they click "Cancel" it sets it to empty. If they click "Add" it sets it to empty! So it's technically already working in Suppliers, but let's be sure.

  // Fix Modal onClose:
  // onClose={() => { setShowForm(false); setEditingId(null); }}
  // Replace with:
  // onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }}
  content = content.replace(/onClose=\{\(\) => \{ setShowForm\(false\); setEditingId\(null\); \}\}/g, 'onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }}');

  // Fix Cancel button in form footer:
  // onClick={() => { setShowForm(false); setEditingId(null); }}
  // Replace with:
  // onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }}
  content = content.replace(/onClick=\{\(\) => \{ setShowForm\(false\); setEditingId\(null\); \}\}/g, 'onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }}');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Fixed state reset in", file);
}
