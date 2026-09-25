const fs = require('fs');
const path = require('path');

function replaceTable(filename, newTableHtml) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  const startIndex = content.indexOf('<table className="w-full text-left text-sm">');
  const endIndex = content.indexOf('</table>', startIndex) + 8;
  
  if (startIndex === -1 || endIndex === -1) {
    console.log(`Table not found in ${filename}`);
    return;
  }
  
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  fs.writeFileSync(filepath, before + newTableHtml + after, 'utf8');
  console.log(`Replaced table in ${filename}`);
}

const materialsTable = `<table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Material ID</th>}
                      {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Material Description</th>}
                      {visibleColumns.includes('category') && <th className="px-6 py-3 font-medium">Category</th>}
                      {visibleColumns.includes('unit') && <th className="px-6 py-3 font-medium">Unit</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Unit Cost (\\u20B1)</th>}
                      {visibleColumns.includes('levels') && <th className="px-6 py-3 font-medium">Reorder / Target</th>}
                      {visibleColumns.includes('stock') && <th className="px-6 py-3 font-medium">Stock Balance</th>}
                      {visibleColumns.includes('status') && <th className="px-6 py-3 font-medium">Status</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{m.material_id}</td>}
                        {visibleColumns.includes('name') && <td className="px-6 py-4">{m.material_description}</td>}
                        {visibleColumns.includes('category') && <td className="px-6 py-4 text-gray-600">{m.category}</td>}
                        {visibleColumns.includes('unit') && <td className="px-6 py-4">{m.unit}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-medium">\\u20B1{Number(m.unit_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('levels') && <td className="px-6 py-4 text-gray-500">{m.reorder_level} / {m.target_level}</td>}
                        {visibleColumns.includes('stock') && <td className="px-6 py-4 font-bold text-gray-900">{m.stock_balance || 0}</td>}
                        {visibleColumns.includes('status') && <td className="px-6 py-4"><span className={\`px-2 py-1 rounded text-xs font-bold \${m.status === 'NORMAL' ? 'bg-green-100 text-green-700' : m.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : m.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{m.status || 'NORMAL'}</span></td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No materials added yet. Add at least 20 for your assignment.</td></tr>
                    )}
                  </tbody>
                </table>`;
replaceTable('Materials.jsx', materialsTable);

const suppliersTable = `<table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Supplier ID</th>}
                      {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Supplier Name</th>}
                      {visibleColumns.includes('contact_person') && <th className="px-6 py-3 font-medium">Contact Person</th>}
                      {visibleColumns.includes('contact_info') && <th className="px-6 py-3 font-medium">Contact Info</th>}
                      {visibleColumns.includes('address') && <th className="px-6 py-3 font-medium">Address / Location</th>}
                      {visibleColumns.includes('materials') && <th className="px-6 py-3 font-medium">Primary Materials Supplied</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{s.supplier_id}</td>}
                        {visibleColumns.includes('name') && <td className="px-6 py-4 font-medium text-gray-900">{s.supplier_name}</td>}
                        {visibleColumns.includes('contact_person') && <td className="px-6 py-4">{s.contact_person}</td>}
                        {visibleColumns.includes('contact_info') && <td className="px-6 py-4 text-gray-600">{s.contact_info}</td>}
                        {visibleColumns.includes('address') && <td className="px-6 py-4 text-gray-500">{s.address_location}</td>}
                        {visibleColumns.includes('materials') && <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{s.primary_materials_supplied}</span></td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No suppliers recorded yet. Add at least 5 for your assignment.</td></tr>
                    )}
                  </tbody>
                </table>`;
replaceTable('Suppliers.jsx', suppliersTable);

const deliveriesTable = `<table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Delivery ID</th>}
                      {visibleColumns.includes('po_no') && <th className="px-6 py-3 font-medium">PO No.</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('supplier') && <th className="px-6 py-3 font-medium">Supplier</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('received_by') && <th className="px-6 py-3 font-medium">Received By</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{d.delivery_id}</td>}
                        {visibleColumns.includes('po_no') && <td className="px-6 py-4 font-medium text-gray-600">{d.po_no}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(d.delivery_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('supplier') && <td className="px-6 py-4 text-gray-600">{d.suppliers?.supplier_name}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{d.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-blue-600">+{d.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1{Number(d.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {deliveries.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No deliveries recorded yet. Add at least 20 for your assignment.</td></tr>
                    )}
                  </tbody>
                </table>`;
replaceTable('Deliveries.jsx', deliveriesTable);

const issuancesTable = `<table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Issuance ID</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('site') && <th className="px-6 py-3 font-medium">Project / Site</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('requested') && <th className="px-6 py-3 font-medium">Requested By</th>}
                      {visibleColumns.includes('released') && <th className="px-6 py-3 font-medium">Released By</th>}
                      {visibleColumns.includes('purpose') && <th className="px-6 py-3 font-medium">Purpose</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {issuances.map((i) => (
                      <tr key={i.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{i.issuance_id}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(i.issuance_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('site') && <td className="px-6 py-4">{i.project_site}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{i.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-amber-600">-{i.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1{Number(i.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('requested') && <td className="px-6 py-4 text-gray-500">{i.requested_by}</td>}
                        {visibleColumns.includes('released') && <td className="px-6 py-4 text-gray-500">{i.released_by}</td>}
                        {visibleColumns.includes('purpose') && <td className="px-6 py-4 text-gray-500">{i.purpose}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(i)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {issuances.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No issuances recorded yet. Add at least 10 for your assignment.</td></tr>
                    )}
                  </tbody>
                </table>`;
replaceTable('Issuances.jsx', issuancesTable);

const returnsTable = `<table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Return ID</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('site') && <th className="px-6 py-3 font-medium">Project / Site</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('returned') && <th className="px-6 py-3 font-medium">Returned By</th>}
                      {visibleColumns.includes('received') && <th className="px-6 py-3 font-medium">Received By</th>}
                      {visibleColumns.includes('reason_condition') && <th className="px-6 py-3 font-medium">Reason & Condition</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {returns.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{r.return_id}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(r.return_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('site') && <td className="px-6 py-4">{r.project_site}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{r.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-green-600">+{r.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1{Number(r.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('returned') && <td className="px-6 py-4 text-gray-500">{r.returned_by}</td>}
                        {visibleColumns.includes('received') && <td className="px-6 py-4 text-gray-500">{r.received_by}</td>}
                        {visibleColumns.includes('reason_condition') && <td className="px-6 py-4 text-gray-500">{r.reason_condition}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {returns.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No returns recorded yet. Add at least 3 for your assignment.</td></tr>
                    )}
                  </tbody>
                </table>`;
replaceTable('Returns.jsx', returnsTable);
