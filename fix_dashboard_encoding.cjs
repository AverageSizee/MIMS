const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/<p className="text-xl md:text-2xl font-bold text-gray-900">.*?\{totalValuation/g, '<p className="text-xl md:text-2xl font-bold text-gray-900">₱{totalValuation');

// Also check the Chart for Valuation Breakdown
content = content.replace(/Valuation Breakdown by Category \(.*?\)/g, 'Valuation Breakdown by Category (₱)');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Fixed Dashboard.jsx encoding');
