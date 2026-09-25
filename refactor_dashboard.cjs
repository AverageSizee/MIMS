const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/m\.name/g, 'm.material_description');
c = c.replace(/m\.min_reorder_level/g, 'm.reorder_level');
c = c.replace(/m\.max_stock_level/g, 'm.target_level');
c = c.replace(/m\.stock/g, 'm.stock_balance');
c = c.replace(/\(m\.stock_balance\s*<\s*0\s*\?\s*0\s*:\s*m\.stock_balance\)/g, "m.stock_balance"); // simplifying since stock_balance is now correct

fs.writeFileSync(file, c, 'utf8');
console.log('Dashboard.jsx mapped to new schema');
