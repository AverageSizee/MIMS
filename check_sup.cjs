const fs = require('fs');
let c = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
const thStart = c.indexOf('<th className="px-6 py-3 font-medium">Added By</th>');
console.log(thStart > -1 ? 'Found Added By TH in Suppliers' : 'Missing Added By TH in Suppliers');

const qStart = c.indexOf('creator:profiles');
console.log(qStart > -1 ? 'Found creator:profiles in Suppliers' : 'Missing creator:profiles in Suppliers');
