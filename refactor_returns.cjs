const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Returns.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const initialFormState = \{/, `const initialFormState = {\n    project_site: '',\n    returned_by: '',\n    received_by: '',\n    reason_condition: '',`);
// Remove old reason and condition from initial state
c = c.replace(/reason: '',\n\s*condition: 'usable'/g, "");

c = c.replace(/return_date: formData\.return_date/g, `return_date: formData.return_date,\n          project_site: formData.project_site,\n          returned_by: formData.returned_by,\n          received_by: formData.received_by`);
// Replace old reason/condition in inserts
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
    { id: 'returned', label: 'Returned By' },
    { id: 'received', label: 'Received By' },
    { id: 'reason_condition', label: 'Reason & Condition' }
  ];`;
c = c.replace(oldTableHeaders, newTableHeaders);

c = c.replace(/\{visibleColumns\.includes\('date'\) && <td className="px-6 py-4">\{new Date\(r\.return_date\)\.toLocaleDateString\(\)\}<\/td>\}/, `{visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(r.return_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('site') && <td className="px-6 py-4">{r.project_site}</td>}`);
                        
c = c.replace(/\{visibleColumns\.includes\('reason'\) && <td className="px-6 py-4">\{r\.reason\}<\/td>\}/, `{visibleColumns.includes('returned') && <td className="px-6 py-4">{r.returned_by}</td>}
                        {visibleColumns.includes('received') && <td className="px-6 py-4">{r.received_by}</td>}
                        {visibleColumns.includes('reason_condition') && <td className="px-6 py-4">{r.reason_condition}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('condition'\) && \([\s\S]*?<\/td>\s*\)\}/, ''); // Remove old condition column

const formFieldsRegex = /(<label className="block text-sm font-medium text-gray-700 mb-1">Date<\/label>[\s\S]*?<\/div>)/;
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

// Replace reason and condition in form
const reasonConditionRegex = /<div className="md:col-span-2">\s*<label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return<\/label>[\s\S]*?<\/div>\s*<\/div>/;
const newReasonCondition = `<div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason & Condition</label>
              <input required type="text" name="reason_condition" value={formData.reason_condition} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
c = c.replace(reasonConditionRegex, newReasonCondition);

c = c.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(availableColumns\.map\(c => c\.id\)\);/, `const [visibleColumns, setVisibleColumns] = useState(['id','date','site','material','quantity','returned','received','reason_condition']);`);

fs.writeFileSync(file, c, 'utf8');
console.log('Returns.jsx mapped to new schema');
