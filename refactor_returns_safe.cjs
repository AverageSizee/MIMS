const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Returns.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const initialFormState = \{[\s\S]*?\};/, `const initialFormState = {\n    return_date: new Date().toISOString().split('T')[0],\n    material_id: '',\n    quantity: '',\n    project_site: '',\n    returned_by: '',\n    received_by: '',\n    reason_condition: ''\n  };`);

c = c.replace(/return_date: formData\.return_date/g, `return_date: formData.return_date,\n          project_site: formData.project_site,\n          returned_by: formData.returned_by,\n          received_by: formData.received_by`);
// Replace reason/condition in inserts
c = c.replace(/reason: formData\.reason,[\s\n]*condition: formData\.condition/g, `reason_condition: formData.reason_condition`);

c = c.replace(/return_date: ret\.return_date/g, `return_date: ret.return_date,\n        project_site: ret.project_site,\n        returned_by: ret.returned_by,\n        received_by: ret.received_by,\n        reason_condition: ret.reason_condition || ''`);
c = c.replace(/reason: ret\.reason \|\| '',[\s\n]*condition: ret\.condition \|\| 'usable'/g, "");

const oldTableHeaders = /const availableColumns = \[[\s\S]*?\];/;
const newTableHeaders = `const availableColumns = [
    { id: 'id', label: 'Return ID' },
    { id: 'date', label: 'Date' },
    { id: 'site', label: 'Project / Site' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'returned', label: 'Returned By' },
    { id: 'received', label: 'Received By' },
    { id: 'reason_condition', label: 'Reason & Condition' }
  ];`;
c = c.replace(oldTableHeaders, newTableHeaders);

// The old map logic in the table
c = c.replace(/\{visibleColumns\.includes\('id_date'\) && \([\s\S]*?<\/td>\s*\)\}/, `{visibleColumns.includes('id') && <td className="px-6 py-4">{r.return_id}</td>}
                      {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(r.return_date).toLocaleDateString()}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('material'\) && <td className="px-6 py-4 font-medium text-gray-900">\{r\.materials\?\.name\}<\/td>\}/, `{visibleColumns.includes('site') && <td className="px-6 py-4">{r.project_site}</td>}
                      {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{r.materials?.material_description}</td>}`);
c = c.replace(/r\.quantity_returned/g, "r.quantity");

// Replace the old condition and project_site and personnel cells with new ones
c = c.replace(/\{visibleColumns\.includes\('condition'\) && \([\s\S]*?<\/td>\s*\)\}/, `{visibleColumns.includes('returned') && <td className="px-6 py-4">{r.returned_by}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('project_site'\) && \([\s\S]*?<\/td>\s*\)\}/, `{visibleColumns.includes('received') && <td className="px-6 py-4">{r.received_by}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('personnel'\) && \([\s\S]*?<\/td>\s*\)\}/, `{visibleColumns.includes('reason_condition') && <td className="px-6 py-4">{r.reason_condition}</td>}
                      {visibleColumns.includes('cost') && <td className="px-6 py-4">\\u20B1{Number(r.total_cost).toFixed(2)}</td>}`);

const formFieldsRegex = /(<label className="block text-sm font-medium text-gray-700 mb-1">Date<\/label>[^<]*<input[^>]*>[\s\n]*<\/div>)/;
const newFields = `$1
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site</label>
              <input required type="text" name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returned By</label>
              <input required type="text" name="returned_by" value={formData.returned_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
c = c.replace(formFieldsRegex, newFields);

// Safely replace Reason and Condition inputs
c = c.replace(/<div className="md:col-span-2">\s*<label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return<\/label>[^<]*<textarea[^>]*><\/textarea>[\s\n]*<\/div>/, `<div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason & Condition</label>
              <input required type="text" name="reason_condition" value={formData.reason_condition} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`);
c = c.replace(/<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Condition<\/label>[\s\S]*?<\/select>[\s\n]*<\/div>/, '');


c = c.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(availableColumns\.map\(c => c\.id\)\);/, `const [visibleColumns, setVisibleColumns] = useState(['id','date','site','material','quantity','cost','returned','received','reason_condition']);`);

fs.writeFileSync(file, c, 'utf8');
console.log('Returns.jsx safely mapped to new schema');
