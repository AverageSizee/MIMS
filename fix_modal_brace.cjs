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

  // Replace </Modal>} with </Modal>
  content = content.replace(/<\/Modal>\s*\}/g, '</Modal>');

  fs.writeFileSync(filePath, content, 'utf8');
}
