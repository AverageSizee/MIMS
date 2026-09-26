const fs = require('fs');
let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
const start = c.indexOf('className="md:hidden');
console.log(c.substring(start + 500, start + 1800));
