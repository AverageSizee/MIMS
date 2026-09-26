const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
const idx = c.indexOf('type="submit"');
console.log(c.substring(idx-200, idx+50));
