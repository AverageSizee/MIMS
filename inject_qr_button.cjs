const fs = require('fs');
const filepath = 'src/pages/Materials.jsx';
let content = fs.readFileSync(filepath, 'utf8');

const searchStr = `        </button>\r\n      </div>\r\n\r\n      <Modal isOpen={showForm}`;
const replaceStr = `        </button>\r\n        <button\r\n          onClick={() => setShowQRSheet(true)}\r\n          title="Print QR shelf labels for all materials"\r\n          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium"\r\n        >\r\n          \uD83C\uDFF7\uFE0F Print QR Labels\r\n        </button>\r\n      </div>\r\n\r\n      <Modal isOpen={showForm}`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('QR Button injected!');
} else {
  // Try LF only
  const searchLF = `        </button>\n      </div>\n\n      <Modal isOpen={showForm}`;
  const replaceLF = `        </button>\n        <button\n          onClick={() => setShowQRSheet(true)}\n          title="Print QR shelf labels for all materials"\n          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors text-sm font-medium"\n        >\n          \uD83C\uDFF7\uFE0F Print QR Labels\n        </button>\n      </div>\n\n      <Modal isOpen={showForm}`;
  if (content.includes(searchLF)) {
    content = content.replace(searchLF, replaceLF);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('QR Button injected (LF)!');
  } else {
    console.log('Could not find target string');
  }
}
