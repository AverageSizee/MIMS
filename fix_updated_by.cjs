const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = ['Materials.jsx', 'Suppliers.jsx', 'Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'];

for (const file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

  // Replace created_by: user.id with created_by: user.id, updated_by: user.id
  // This assumes the insert logic looks like: { ...formData, created_by: user.id }
  content = content.replace(/created_by:\s*user\.id\s*\}/g, 'created_by: user.id, updated_by: user.id }');
  content = content.replace(/created_by:\s*user\.id\s*\]/g, 'created_by: user.id, updated_by: user.id ]');

  fs.writeFileSync(path.join(pagesDir, file), content, 'utf8');
}

console.log("Updated create forms to set updated_by!");
