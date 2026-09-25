const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/name: '',/g, "material_description: '',");
c = c.replace(/unit_of_measurement: '',/g, "unit: '',");
c = c.replace(/min_reorder_level: '',/g, "reorder_level: '',");
c = c.replace(/max_stock_level: ''/g, "target_level: ''");

c = c.replace(/name: formData\.name/g, "material_description: formData.material_description");
c = c.replace(/unit_of_measurement: formData\.unit_of_measurement/g, "unit: formData.unit");
c = c.replace(/min_reorder_level: formData\.min_reorder_level/g, "reorder_level: formData.reorder_level");
c = c.replace(/max_stock_level: formData\.max_stock_level/g, "target_level: formData.target_level");

c = c.replace(/name: mat\.name/g, "material_description: mat.material_description");
c = c.replace(/unit_of_measurement: mat\.unit_of_measurement/g, "unit: mat.unit");
c = c.replace(/min_reorder_level: mat\.min_reorder_level/g, "reorder_level: mat.reorder_level");
c = c.replace(/max_stock_level: mat\.max_stock_level/g, "target_level: mat.target_level");

c = c.replace(/m !== mat\.name/g, "m !== mat.material_description");
c = c.replace(/\.includes\(mat\.name\)/g, ".includes(mat.material_description)");
c = c.replace(/\?\.name \|\|/g, "?.material_description ||");
c = c.replace(/\{m\.name\}/g, "{m.material_description}");
c = c.replace(/\{m\.unit_of_measurement\}/g, "{m.unit}");
c = c.replace(/m\.min_reorder_level/g, "m.reorder_level");
c = c.replace(/m\.max_stock_level/g, "m.target_level");

c = c.replace(/name="name"/g, 'name="material_description"');
c = c.replace(/value=\{formData\.name\}/g, "value={formData.material_description}");
c = c.replace(/name="unit_of_measurement"/g, 'name="unit"');
c = c.replace(/value=\{formData\.unit_of_measurement\}/g, "value={formData.unit}");
c = c.replace(/name="min_reorder_level"/g, 'name="reorder_level"');
c = c.replace(/value=\{formData\.min_reorder_level\}/g, "value={formData.reorder_level}");
c = c.replace(/name="max_stock_level"/g, 'name="target_level"');
c = c.replace(/value=\{formData\.max_stock_level\}/g, "value={formData.target_level}");

c = c.replace(/<label[^>]*>Name<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Material Description</label>');
c = c.replace(/<label[^>]*>Unit<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>');
c = c.replace(/<label[^>]*>Min Reorder<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>');
c = c.replace(/<label[^>]*>Max Level<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>');

// Table Headers
c = c.replace(
  /const availableColumns = \[[\s\S]*?\];/,
  `const availableColumns = [
    { id: 'id', label: 'Material ID' },
    { id: 'name', label: 'Material Description' },
    { id: 'category', label: 'Category' },
    { id: 'unit', label: 'Unit' },
    { id: 'cost', label: 'Unit Cost (\\u20B1)' },
    { id: 'levels', label: 'Reorder / Target' },
    { id: 'stock', label: 'Stock Balance' },
    { id: 'status', label: 'Status' }
  ];`
);

// Add missing columns to table row
const oldTableRowRegex = /<td className="px-6 py-4 text-gray-500">\{m\.reorder_level\} \/ \{m\.target_level\}<\/td>\}/;
const newTableRow = `<td className="px-6 py-4 text-gray-500">{m.reorder_level} / {m.target_level}</td>}
                        {visibleColumns.includes('stock') && <td className="px-6 py-4 font-bold text-gray-900">{m.stock_balance || 0}</td>}
                        {visibleColumns.includes('status') && <td className="px-6 py-4"><span className={\`px-2 py-1 rounded text-xs font-bold \${m.status === 'NORMAL' ? 'bg-green-100 text-green-700' : m.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : m.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{m.status || 'NORMAL'}</span></td>}`;
c = c.replace(oldTableRowRegex, newTableRow);

// Fix visible columns default state to include the new columns
c = c.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(availableColumns\.map\(c => c\.id\)\);/, `const [visibleColumns, setVisibleColumns] = useState(['id','name','category','unit','cost','levels','stock','status']);`);

// Update mobile view cards if needed (I'll skip full mobile card updates for stock/status to keep script simple, wait, mobile view is important. I'll inject it)
c = c.replace(
  /\{visibleColumns\.includes\('cost'\) && \([\s\S]*?<\/div>\s*\)\}/,
  `{visibleColumns.includes('cost') && (
                        <div><p className="text-xs text-gray-500">Unit Cost</p><p className="font-medium text-gray-800">\\u20B1{Number(m.unit_cost).toFixed(2)}</p></div>
                      )}
                      {visibleColumns.includes('stock') && (
                        <div><p className="text-xs text-gray-500">Stock Balance</p><p className="font-bold text-gray-900">{m.stock_balance || 0}</p></div>
                      )}
                      {visibleColumns.includes('status') && (
                        <div><p className="text-xs text-gray-500">Status</p><span className={\`px-2 py-1 rounded text-xs font-bold \${m.status === 'NORMAL' ? 'bg-green-100 text-green-700' : m.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : m.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{m.status || 'NORMAL'}</span></div>
                      )}`
);


fs.writeFileSync(file, c, 'utf8');
console.log('Materials.jsx mapped to new schema');
