const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
const start = c.indexOf('className="md:hidden');
console.log(c.substring(start, start + 2500));
