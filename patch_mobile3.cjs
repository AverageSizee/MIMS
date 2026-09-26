const fs = require('fs');
function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}

try {
    // --- 1. Deliveries.jsx ---
    let del = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
    del = replaceAll(del, `visibleColumns.includes('id_date')`, `(visibleColumns.includes('id') || visibleColumns.includes('date'))`);
    del = replaceAll(del, `visibleColumns.includes('qty')`, `visibleColumns.includes('quantity')`);
    del = replaceAll(del, `{d.quantity_delivered}`, `{d.quantity}`);
    
    // Fix PO Number and Received By overlaps
    del = replaceAll(del, `visibleColumns.includes('po') && (\n                      <div><p className="text-xs text-gray-500">PO Number</p><p className="font-medium text-gray-800">{d.purchase_order_number}</p></div>`, `visibleColumns.includes('po_no') && (\n                      <div><p className="text-xs text-gray-500">PO No.</p><p className="font-medium text-gray-800">{d.po_no || '-'}</p></div>`);
    del = replaceAll(del, `visibleColumns.includes('po') && (\r\n                      <div><p className="text-xs text-gray-500">PO Number</p><p className="font-medium text-gray-800">{d.purchase_order_number}</p></div>`, `visibleColumns.includes('po_no') && (\r\n                      <div><p className="text-xs text-gray-500">PO No.</p><p className="font-medium text-gray-800">{d.po_no || '-'}</p></div>`);

    del = replaceAll(del, `visibleColumns.includes('po') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received_by') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`);
    del = replaceAll(del, `visibleColumns.includes('po') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received_by') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`);

    fs.writeFileSync('src/pages/Deliveries.jsx', del, 'utf8');

    // --- 2. Issuances.jsx ---
    let iss = fs.readFileSync('src/pages/Issuances.jsx', 'utf8');
    iss = replaceAll(iss, `visibleColumns.includes('id_date')`, `(visibleColumns.includes('id') || visibleColumns.includes('date'))`);
    iss = replaceAll(iss, `visibleColumns.includes('qty')`, `visibleColumns.includes('quantity')`);
    iss = replaceAll(iss, `{i.quantity_issued}`, `{i.quantity}`);
    iss = replaceAll(iss, `visibleColumns.includes('project_site')`, `(visibleColumns.includes('site') || visibleColumns.includes('purpose'))`);
    iss = replaceAll(iss, `visibleColumns.includes('personnel') && (\n                      <div><p className="text-xs text-gray-500">Requested By</p>`, `visibleColumns.includes('requested') && (\n                      <div><p className="text-xs text-gray-500">Requested By</p>`);
    iss = replaceAll(iss, `visibleColumns.includes('personnel') && (\r\n                      <div><p className="text-xs text-gray-500">Requested By</p>`, `visibleColumns.includes('requested') && (\r\n                      <div><p className="text-xs text-gray-500">Requested By</p>`);
    iss = replaceAll(iss, `visibleColumns.includes('personnel') && (\n                      <div><p className="text-xs text-gray-500">Released By</p>`, `visibleColumns.includes('released') && (\n                      <div><p className="text-xs text-gray-500">Released By</p>`);
    iss = replaceAll(iss, `visibleColumns.includes('personnel') && (\r\n                      <div><p className="text-xs text-gray-500">Released By</p>`, `visibleColumns.includes('released') && (\r\n                      <div><p className="text-xs text-gray-500">Released By</p>`);
    fs.writeFileSync('src/pages/Issuances.jsx', iss, 'utf8');

    // --- 3. Returns.jsx ---
    let ret = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
    ret = replaceAll(ret, `visibleColumns.includes('id_date')`, `(visibleColumns.includes('id') || visibleColumns.includes('date'))`);
    ret = replaceAll(ret, `visibleColumns.includes('qty')`, `visibleColumns.includes('quantity')`);
    ret = replaceAll(ret, `visibleColumns.includes('condition')`, `visibleColumns.includes('reason_condition')`);
    ret = replaceAll(ret, `visibleColumns.includes('project_site')`, `(visibleColumns.includes('site') || visibleColumns.includes('reason_condition'))`);
    ret = replaceAll(ret, `visibleColumns.includes('personnel') && (\n                      <div><p className="text-xs text-gray-500">Returned By</p>`, `visibleColumns.includes('returned') && (\n                      <div><p className="text-xs text-gray-500">Returned By</p>`);
    ret = replaceAll(ret, `visibleColumns.includes('personnel') && (\r\n                      <div><p className="text-xs text-gray-500">Returned By</p>`, `visibleColumns.includes('returned') && (\r\n                      <div><p className="text-xs text-gray-500">Returned By</p>`);
    ret = replaceAll(ret, `visibleColumns.includes('personnel') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`);
    ret = replaceAll(ret, `visibleColumns.includes('personnel') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`);
    // Add missing cost
    if (!ret.includes(`visibleColumns.includes('cost')`)) {
        const costSnippet = `                    {visibleColumns.includes('cost') && (\n                      <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-medium text-gray-800">₱{Number(r.total_cost).toFixed(2)}</p></div>\n                    )}\n`;
        const costSnippetCRLF = `                    {visibleColumns.includes('cost') && (\r\n                      <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-medium text-gray-800">₱{Number(r.total_cost).toFixed(2)}</p></div>\r\n                    )}\r\n`;
        if (ret.includes(`visibleColumns.includes('quantity') && (`)) {
            ret = replaceAll(ret, `                    {visibleColumns.includes('quantity') && (\n                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-green-600">+{r.quantity}</p></div>\n                    )}\n`, `                    {visibleColumns.includes('quantity') && (\n                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-green-600">+{r.quantity}</p></div>\n                    )}\n` + costSnippet);
            ret = replaceAll(ret, `                    {visibleColumns.includes('quantity') && (\r\n                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-green-600">+{r.quantity}</p></div>\r\n                    )}\r\n`, `                    {visibleColumns.includes('quantity') && (\r\n                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-green-600">+{r.quantity}</p></div>\r\n                    )}\r\n` + costSnippetCRLF);
        }
    }
    fs.writeFileSync('src/pages/Returns.jsx', ret, 'utf8');

    // --- 4. Materials.jsx ---
    let mat = fs.readFileSync('src/pages/Materials.jsx', 'utf8');
    mat = replaceAll(mat, `visibleColumns.includes('uom')`, `visibleColumns.includes('unit')`);
    fs.writeFileSync('src/pages/Materials.jsx', mat, 'utf8');

    // --- 5. Suppliers.jsx ---
    let sup = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
    sup = replaceAll(sup, `visibleColumns.includes('supplies')`, `visibleColumns.includes('materials')`);
    
    if (!sup.includes(`visibleColumns.includes('address')`)) {
        const addressSnippet = `                    {visibleColumns.includes('address') && (\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="font-medium text-gray-800">{s.address || '-'}</p></div>\n                    )}\n`;
        const addressSnippetCRLF = `                    {visibleColumns.includes('address') && (\r\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="font-medium text-gray-800">{s.address || '-'}</p></div>\r\n                    )}\r\n`;
        if (sup.includes(`visibleColumns.includes('contact_info') && (`)) {
             sup = replaceAll(sup, `                    {visibleColumns.includes('contact_info') && (\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Contact Info</p><p className="font-medium text-gray-800">{s.contact_number}</p><p className="text-xs text-gray-500">{s.email}</p></div>\n                    )}\n`, `                    {visibleColumns.includes('contact_info') && (\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Contact Info</p><p className="font-medium text-gray-800">{s.contact_number}</p><p className="text-xs text-gray-500">{s.email}</p></div>\n                    )}\n` + addressSnippet);
             sup = replaceAll(sup, `                    {visibleColumns.includes('contact_info') && (\r\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Contact Info</p><p className="font-medium text-gray-800">{s.contact_number}</p><p className="text-xs text-gray-500">{s.email}</p></div>\r\n                    )}\r\n`, `                    {visibleColumns.includes('contact_info') && (\r\n                      <div className="col-span-2"><p className="text-xs text-gray-500">Contact Info</p><p className="font-medium text-gray-800">{s.contact_number}</p><p className="text-xs text-gray-500">{s.email}</p></div>\r\n                    )}\r\n` + addressSnippetCRLF);
        }
    }
    fs.writeFileSync('src/pages/Suppliers.jsx', sup, 'utf8');

    console.log('Mobile columns mapped correctly!');
} catch (e) {
    console.log(e);
}
