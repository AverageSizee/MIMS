const fs = require('fs');
let content = fs.readFileSync('src/pages/Materials.jsx', 'utf8');

const searchString = 'onClick={() => setQrMaterial(m)} title="View QR Code"';

let idx = content.indexOf(searchString);
if (idx > -1) {
    let startIdx = content.lastIndexOf('<button', idx);
    let endIdx = content.indexOf('</button>', idx) + 9;
    
    let buttonHtml = content.substring(startIdx, endIdx);
    
    let newHtml = `{m.has_supplier && (\n` + buttonHtml + `\n)}`;
    
    content = content.substring(0, startIdx) + newHtml + content.substring(endIdx);
    fs.writeFileSync('src/pages/Materials.jsx', content, 'utf8');
    console.log('Replaced successfully via substring');
} else {
    console.log('Not found');
}
