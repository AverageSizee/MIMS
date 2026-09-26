const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
let lines = c.split('\n').filter(l => l.includes("supabase.from('deliveries')"));
lines.forEach(l => console.log(l.trim()));
