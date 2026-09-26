const fs = require('fs');
let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');

c = c.replace(/r\.condition/g, 'r.reason_condition');
c = c.replace(/r\.reason/g, 'r.reason_condition');

fs.writeFileSync('src/pages/Returns.jsx', c, 'utf8');
console.log('Fixed Returns mobile mapping');
