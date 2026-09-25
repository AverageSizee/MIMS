const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Issuances.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add cost_code to initialFormState
content = content.replace(
  "purpose: ''",
  "purpose: '',\n    cost_code: ''"
);

// 2. Add cost_code to availableColumns
content = content.replace(
  "{ id: 'purpose', label: 'Purpose' }",
  "{ id: 'purpose', label: 'Purpose' },\n    { id: 'cost_code', label: 'WBS Cost Code' }"
);

// 3. Add to Form Modal
const formPurpose = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input required type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
const newFormCostCode = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WBS Cost Code</label>
              <input type="text" name="cost_code" value={formData.cost_code} onChange={handleInputChange} placeholder="e.g. 03-3000" className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
content = content.replace(formPurpose, formPurpose + '\n            ' + newFormCostCode);

// 4. Add to Table Header
const thPurpose = `{visibleColumns.includes('purpose') && <th className="px-6 py-3 font-medium">Purpose</th>}`;
const thCostCode = `{visibleColumns.includes('cost_code') && <th className="px-6 py-3 font-medium text-purple-200">WBS Cost Code</th>}`;
content = content.replace(thPurpose, thPurpose + '\n                    ' + thCostCode);

// 5. Add to Table Row
const tdPurpose = `{visibleColumns.includes('purpose') && <td className="px-6 py-4 text-gray-500">{i.purpose}</td>}`;
const tdCostCode = `{visibleColumns.includes('cost_code') && <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-mono">{i.cost_code || '-'}</span></td>}`;
content = content.replace(tdPurpose, tdPurpose + '\n                        ' + tdCostCode);

// 6. Add to Mobile View
const mobilePurpose = `<div><p className="text-xs text-gray-500">Purpose</p><p className="font-medium text-gray-800">{i.purpose}</p></div>`;
const mobileCostCode = `<div><p className="text-xs text-gray-500">WBS Cost Code</p><p className="font-mono text-xs text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-200 mt-1 inline-block">{i.cost_code || '-'}</p></div>`;
content = content.replace(mobilePurpose, mobilePurpose + '\n                    ' + mobileCostCode);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Issuances patched with WBS cost code');
