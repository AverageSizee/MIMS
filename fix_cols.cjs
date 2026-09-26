const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

const tHeadOld = `<th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>`;
const tHeadNew = `{visibleColumns.includes('photo_url') && <th className="px-6 py-3 font-medium">Attachment</th>}
                      {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                      {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>`;

const trOld = `{visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}
                        <td className="px-6 py-4 text-right">`;
const trNew = `{visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}
                        {visibleColumns.includes('photo_url') && <td className="px-6 py-4">
                          {d.photo_url ? (
                            <span className="flex items-center text-blue-600">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>}
                        {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{d.creator?.full_name || 'System'}</td>}
                        {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{d.updater?.full_name || '-'}</td>}
                        <td className="px-6 py-4 text-right">`;

const mobileOld = `{visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{d.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>`;
const mobileNew = `{visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{d.updater?.full_name || '-'}</p></div>
                    )}
                    {visibleColumns.includes('photo_url') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Attachment</p><div className="font-medium text-gray-800">
                          {d.photo_url ? (
                            <span className="flex items-center text-blue-600 mt-1">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                            </span>
                          ) : <span className="text-gray-400 text-sm">None</span>}
                      </div></div>
                    )}
                  </div>
                </div>`;

c = c.replace(tHeadOld, tHeadNew);
if (!c.includes(tHeadNew)) c = c.replace(tHeadOld.replace(/\n/g, '\r\n'), tHeadNew.replace(/\n/g, '\r\n'));

c = c.replace(trOld, trNew);
if (!c.includes(trNew)) c = c.replace(trOld.replace(/\n/g, '\r\n'), trNew.replace(/\n/g, '\r\n'));

c = c.replace(mobileOld, mobileNew);
if (!c.includes(mobileNew)) c = c.replace(mobileOld.replace(/\n/g, '\r\n'), mobileNew.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
console.log('Deliveries photo columns patched!');
