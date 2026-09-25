const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/item\.current_stock/g, 'item.stock_balance');
// Wait, the "CRITICAL ACTION LIST" table has hardcoded column names too?
// Let's check:
c = c.replace(/<th className="px-6 py-3 font-medium">CURRENT STOCK<\/th>/, '<th className="px-6 py-3 font-medium text-right">CURRENT STOCK</th>'); // it's already there?

fs.writeFileSync(file, c, 'utf8');
console.log('Dashboard fixed');
