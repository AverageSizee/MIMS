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
    del = replaceAll(del, `visibleColumns.includes('po') && (\n                      <div><p className="text-xs text-gray-500">PO Number</p><p className="font-medium text-gray-800">{d.purchase_order_number}</p></div>`, `visibleColumns.includes('po_no') && (\n                      <div><p className="text-xs text-gray-500">PO No.</p><p className="font-medium text-gray-800">{d.po_no || 'N/A'}</p></div>`);
    del = replaceAll(del, `visibleColumns.includes('po') && (\n                      <div><p className="text-xs text-gray-500">PO Number</p><p className="font-medium text-gray-800">{d.purchase_order_number}</p></div>`.replace(/\n/g, '\r\n'), `visibleColumns.includes('po_no') && (\r\n                      <div><p className="text-xs text-gray-500">PO No.</p><p className="font-medium text-gray-800">{d.po_no || 'N/A'}</p></div>`);
    
    del = replaceAll(del, `visibleColumns.includes('po') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received_by') && (\n                      <div><p className="text-xs text-gray-500">Received By</p>`);
    del = replaceAll(del, `visibleColumns.includes('po') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`, `visibleColumns.includes('received_by') && (\r\n                      <div><p className="text-xs text-gray-500">Received By</p>`);
    fs.writeFileSync('src/pages/Deliveries.jsx', del, 'utf8');
    console.log('Fixed Deliveries');

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
    console.log('Fixed Issuances');

    // --- 3. Returns.jsx ---
    let ret = fs.readFileSync('src/pages/Returns.jsx', 'utf8');
    ret = replaceAll(ret, `visibleColumns.includes('id_date')`, `(visibleColumns.includes('id') || visibleColumns.includes('date'))`);
    ret = replaceAll(ret, `visibleColumns.includes('qty')`, `visibleColumns.includes('quantity')`);
    ret = replaceAll(ret, `visibleColumns.includes('project_site')`, `(visibleColumns.includes('site') || visibleColumns.includes('reason'))`);
    ret = replaceAll(ret, `visibleColumns.includes('condition')`, `visibleColumns.includes('reason')`); // Since availableColumns uses reason, let's map condition and reason to just 'reason' or if reason_condition, whatever it uses. Wait, Returns availableColumns uses 'reason' or 'condition'? 
    // Wait, Returns has 'condition' and 'reason'? 
    
} catch (e) {
    console.log(e);
}
