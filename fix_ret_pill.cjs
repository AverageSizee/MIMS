const fs = require('fs');
let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');

const oldSnippet = `<p className="text-xs text-gray-500 mb-1">Condition</p>
                        <span className={\`px-2 py-1 rounded text-xs \${
                          r.reason_condition === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }\`}>
                          {r.reason_condition}
                        </span>`;
const oldSnippetCRLF = oldSnippet.replace(/\n/g, '\r\n');

const newSnippet = `<p className="text-xs text-gray-500">Reason / Condition</p>
                        <p className="font-medium text-gray-800">{r.reason_condition}</p>`;

if (c.includes(oldSnippet)) {
    c = c.replace(oldSnippet, newSnippet);
} else if (c.includes(oldSnippetCRLF)) {
    c = c.replace(oldSnippetCRLF, newSnippet.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/pages/Returns.jsx', c, 'utf8');
console.log('Fixed pill styling in mobile view');
