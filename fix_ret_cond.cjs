const fs = require('fs');

let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');

// The desktop view probably got mangled: r.reason_condition_condition
c = c.replace(/reason_condition_condition/g, 'reason_condition');

// Wait, what if there's reason_condition_condition_condition?
while(c.includes('reason_condition_condition')) {
    c = c.replace(/reason_condition_condition/g, 'reason_condition');
}

fs.writeFileSync('src/pages/Returns.jsx', c, 'utf8');
console.log('Fixed reason_condition_condition in Returns.jsx');
