const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

const peso = '\u20B1';

// We just replace the exact fragments
content = content.replace(/label: `[^$]*?\$\{/g, 'label: `'+peso+'${');
content = content.replace(/<Tooltip formatter=\{\(value\) => `[^$]*?\$\{/g, '<Tooltip formatter={(value) => `'+peso+'${');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Dashboard currency');
