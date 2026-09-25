const fs = require('fs');
const path = require('path');

function fixPesoSymbol(filename) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Replace the literal string "\u20B1" with the actual symbol "₱"
  content = content.split('\\u20B1').join('₱');
  // Also replace any instances where it might be double escaped
  content = content.split('\\\\u20B1').join('₱');
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Updated ${filename}`);
}

['Deliveries.jsx', 'Issuances.jsx', 'Materials.jsx', 'Returns.jsx'].forEach(fixPesoSymbol);
