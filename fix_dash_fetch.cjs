const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\.order\('name'\)/g, ".order('material_description')");
c = c.replace(/const \{ data: matData[\s\S]*?setInventory\(merged\);/m, "setInventory(invData || []);");

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed Dashboard fetch');
