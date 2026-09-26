const fs = require('fs');

const filesToPatch = ['Issuances.jsx', 'Returns.jsx', 'Materials.jsx', 'Suppliers.jsx', 'Categories.jsx', 'Projects.jsx'];

filesToPatch.forEach(file => {
    try {
        let c = fs.readFileSync('src/pages/' + file, 'utf8');
        
        // 1. Patch the select queries
        let selectStr = '';
        if (file === 'Issuances.jsx') selectStr = `'*, materials(material_description)'`;
        else if (file === 'Returns.jsx') selectStr = `'*, materials(material_description)'`;
        else if (file === 'Suppliers.jsx') selectStr = `'*'`;
        else if (file === 'Materials.jsx') selectStr = `'*'`;
        else if (file === 'Categories.jsx') selectStr = `'*'`;
        else if (file === 'Projects.jsx') selectStr = `'*'`;

        if (selectStr) {
            const newSelectStr = selectStr.replace(/'/, '').replace(/'$/, ', creator:profiles!created_by(full_name), updater:profiles!updated_by(full_name)\'');
            // Materials has a specific view
            c = c.replace(new RegExp(`\\.select\\(${selectStr.replace(/[*()]/g, '\\$&')}\\)`, 'g'), `.select('${newSelectStr}')`);
        }
        
        // 2. Patch the Table Headers (Desktop)
        const tHeadOld = `<th className="px-6 py-3 font-medium text-right">Actions</th>`;
        const tHeadNew = `{visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                      {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>`;
        if (c.includes(tHeadOld) && !c.includes("Added By</th>")) {
            c = c.replace(tHeadOld, tHeadNew);
        } else if (c.includes(tHeadOld.replace(/\n/g, '\r\n')) && !c.includes("Added By</th>")) {
            c = c.replace(tHeadOld.replace(/\n/g, '\r\n'), tHeadNew.replace(/\n/g, '\r\n'));
        }

        // 3. Patch the Table Cells (Desktop)
        const tCellOld = `<td className="px-6 py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }}`;
        const tCellOld2 = `<td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(d)}`;
        const tCellOld3 = `<td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">`;
        
        const tCellNewBase = `{visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{d.creator?.full_name || 'System'}</td>}
                        {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{d.updater?.full_name || '-'}</td>}\n                        `;
                        
        if (c.includes(tCellOld) && !c.includes("d.creator?.full_name")) {
            c = c.replace(tCellOld, tCellNewBase + tCellOld);
        } else if (c.includes(tCellOld.replace(/\n/g, '\r\n')) && !c.includes("d.creator?.full_name")) {
            c = c.replace(tCellOld.replace(/\n/g, '\r\n'), tCellNewBase.replace(/\n/g, '\r\n') + tCellOld.replace(/\n/g, '\r\n'));
        } else if (c.includes(tCellOld2) && !c.includes("d.creator?.full_name")) {
            c = c.replace(tCellOld2, tCellNewBase + tCellOld2);
        } else if (c.includes(tCellOld3) && !c.includes("d.creator?.full_name")) {
            c = c.replace(tCellOld3, tCellNewBase + tCellOld3);
        }

        // 4. Patch Mobile view
        // Hard to pinpoint exactly where to inject for all files automatically without parsing, 
        // but they usually end with an Edit2 button or Trash2 button div.
        // Actually, we can just look for the div holding the Action buttons in mobile view.
        const mobileActionOld = `<div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }}`;
        const mobileActionOld2 = `<div className="flex gap-2">
                        <button onClick={() => handleEdit(d)}`;
        
        const mobileNewBase = `{visibleColumns.includes('created_by') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{d.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{d.updater?.full_name || '-'}</p></div>
                    )}\n                    `;

        // Inject right before the closing </div> of the grid, which is above the flex gap-2 buttons
        // Let's just find the text-sm grid end.
        
        fs.writeFileSync('src/pages/' + file, c, 'utf8');
        console.log('Patched select queries & desktop columns in', file);
    } catch(e) {
        console.log('Failed', file, e.message);
    }
});
