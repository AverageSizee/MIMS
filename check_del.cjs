const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
const idx = c.indexOf('text-lg font-medium');
console.log(c.substring(idx-100, idx+500));
