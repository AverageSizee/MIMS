const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Issuances.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const initialFormState = \{/, `const initialFormState = {\n    project_site: '',\n    requested_by: '',\n    released_by: '',`);
c = c.replace(/issuance_date: formData\.issuance_date/g, `issuance_date: formData.issuance_date,\n          project_site: formData.project_site,\n          requested_by: formData.requested_by,\n          released_by: formData.released_by`);
c = c.replace(/issuance_date: issuance\.issuance_date/g, `issuance_date: issuance.issuance_date,\n        project_site: issuance.project_site,\n        requested_by: issuance.requested_by,\n        released_by: issuance.released_by`);

const oldTableHeaders = /const availableColumns = \[[\s\S]*?\];/;
const newTableHeaders = `const availableColumns = [
    { id: 'id', label: 'Issuance ID' },
    { id: 'date', label: 'Date' },
    { id: 'site', label: 'Project / Site' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'requested', label: 'Requested By' },
    { id: 'released', label: 'Released By' },
    { id: 'purpose', label: 'Purpose' }
  ];`;
c = c.replace(oldTableHeaders, newTableHeaders);

c = c.replace(/\{visibleColumns\.includes\('date'\) && <td className="px-6 py-4">\{new Date\(i\.issuance_date\)\.toLocaleDateString\(\)\}<\/td>\}/, `{visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(i.issuance_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('site') && <td className="px-6 py-4">{i.project_site}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('cost'\) && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1\{Number\(i\.total_cost\)\.toFixed\(2\)\}<\/td>\}/, `{visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1{Number(i.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('requested') && <td className="px-6 py-4">{i.requested_by}</td>}
                        {visibleColumns.includes('released') && <td className="px-6 py-4">{i.released_by}</td>}`);

const formFieldsRegex = /(<label className="block text-sm font-medium text-gray-700 mb-1">Date<\/label>[\s\S]*?<\/div>)/;
const newFields = `$1
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site</label>
              <input required type="text" name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <input required type="text" name="requested_by" value={formData.requested_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Released By</label>
              <input required type="text" name="released_by" value={formData.released_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
c = c.replace(formFieldsRegex, newFields);

c = c.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(availableColumns\.map\(c => c\.id\)\);/, `const [visibleColumns, setVisibleColumns] = useState(['id','date','site','material','quantity','cost','requested','released','purpose']);`);

fs.writeFileSync(file, c, 'utf8');
console.log('Issuances.jsx mapped to new schema');
