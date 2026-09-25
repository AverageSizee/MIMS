const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/supp\.materials_supplied/g, 'supp.primary_materials_supplied');
c = c.replace(/s\.materials_supplied/g, 's.primary_materials_supplied');
c = c.replace(/\{ materials_supplied: newMats \}/g, '{ primary_materials_supplied: newMats }');
c = c.replace(/s\.name/g, 's.supplier_name');

fs.writeFileSync(file, c, 'utf8');
console.log('Materials.jsx cascade delete logic patched');
