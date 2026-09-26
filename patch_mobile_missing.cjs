const fs = require('fs');

let ret = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
if (!ret.includes(`visibleColumns.includes('cost')`)) {
    ret = ret.split(`{visibleColumns.includes('quantity') && (`).join(
`{visibleColumns.includes('cost') && (
                      <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-medium text-gray-800">₱{Number(r.total_cost).toFixed(2)}</p></div>
                    )}
                    {visibleColumns.includes('quantity') && (`);
    fs.writeFileSync('src/pages/Returns.jsx', ret, 'utf8');
}

let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
if (!sup.includes(`visibleColumns.includes('address')`)) {
    sup = sup.split(`{visibleColumns.includes('contact_info') && (`).join(
`{visibleColumns.includes('address') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="font-medium text-gray-800">{s.address || '-'}</p></div>
                    )}
                    {visibleColumns.includes('contact_info') && (`);
    fs.writeFileSync('src/pages/Suppliers.jsx', sup, 'utf8');
}
