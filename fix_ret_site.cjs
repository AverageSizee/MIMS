const fs = require('fs');
let c = fs.readFileSync('src/pages/Returns.jsx', 'utf8');

// I will just replace the entire site rendering block to be clean.
const oldSite = `{(visibleColumns.includes('site') || visibleColumns.includes('reason_condition')) && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Project / Site (Reason)</p><p className="font-medium text-gray-800">{r.project_site}</p><p className="text-xs text-gray-500">{r.reason_condition}</p></div>
                    )}`;
const oldSiteCRLF = oldSite.replace(/\n/g, '\r\n');

const newSite = `{visibleColumns.includes('site') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Project / Site</p><p className="font-medium text-gray-800">{r.project_site}</p></div>
                    )}`;

if (c.includes(oldSite)) {
    c = c.replace(oldSite, newSite);
} else if (c.includes(oldSiteCRLF)) {
    c = c.replace(oldSiteCRLF, newSite.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/pages/Returns.jsx', c, 'utf8');
console.log('Fixed site rendering logic in mobile');
