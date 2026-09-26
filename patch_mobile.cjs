const fs = require('fs');

['Issuances.jsx', 'Returns.jsx', 'Materials.jsx', 'Suppliers.jsx'].forEach(file => {
    let c = fs.readFileSync('src/pages/' + file, 'utf8');

    const mobileNewBase = `{visibleColumns.includes('created_by') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{d.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{d.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>`;
                
    const mobileEndMarker = `</div>\n                </div>\n              ))}
              {`;
    const mobileEndMarkerCRLF = `</div>\r\n                </div>\r\n              ))}\r\n              {`;

    // Wait, let's just find `</div>\n                </div>` inside the mobile loop map.
    // It's the end of the mobile card.
    
    // Easier way: replace `</div>\n                </div>` for the first occurrence BEFORE `{paginatedData.map` NO! After `paginatedData.map`.
    // Actually, I can search for `onClick={() => handleEdit(d)}` and go UP to the `</div>\n                </div>` above it? No, the action buttons are at the top usually.
    // Let's just look at Issuances.jsx.
});
