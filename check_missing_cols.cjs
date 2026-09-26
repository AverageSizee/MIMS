const fs = require('fs');
let ret = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
console.log('Returns has cost:', ret.includes("visibleColumns.includes('cost')"));
console.log('Suppliers has address:', sup.includes("visibleColumns.includes('address')"));
