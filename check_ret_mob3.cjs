const fs = require('fs');
let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
const start = c.indexOf('r.project_site');
console.log(c.substring(start - 200, start + 300));
