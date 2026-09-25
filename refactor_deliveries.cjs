const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Deliveries.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const initialFormState = \{/, `const initialFormState = {\n    po_no: '',\n    received_by: '',`);
c = c.replace(/delivery_date: formData\.delivery_date/g, `delivery_date: formData.delivery_date,\n          po_no: formData.po_no,\n          received_by: formData.received_by`);
c = c.replace(/delivery_date: delivery\.delivery_date/g, `delivery_date: delivery.delivery_date,\n        po_no: delivery.po_no,\n        received_by: delivery.received_by`);

const oldTableHeaders = /const availableColumns = \[[\s\S]*?\];/;
const newTableHeaders = `const availableColumns = [
    { id: 'id', label: 'Delivery ID' },
    { id: 'po_no', label: 'PO No.' },
    { id: 'date', label: 'Date' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'received_by', label: 'Received By' }
  ];`;
c = c.replace(oldTableHeaders, newTableHeaders);

c = c.replace(/\{visibleColumns\.includes\('id'\) && <td className="px-6 py-4">\{d\.delivery_id\}<\/td>\}/, `{visibleColumns.includes('id') && <td className="px-6 py-4">{d.delivery_id}</td>}
                        {visibleColumns.includes('po_no') && <td className="px-6 py-4">{d.po_no}</td>}`);
c = c.replace(/\{visibleColumns\.includes\('cost'\) && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1\{Number\(d\.total_cost\)\.toFixed\(2\)\}<\/td>\}/, `{visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">\\u20B1{Number(d.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}`);

// Update inputs for po_no and received_by
const formFieldsRegex = /(<label className="block text-sm font-medium text-gray-700 mb-1">Date<\/label>[\s\S]*?<\/div>)/;
const newFields = `$1
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO No.</label>
              <input required type="text" name="po_no" value={formData.po_no} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>`;
c = c.replace(formFieldsRegex, newFields);

// Fix visible columns default state to include the new columns
c = c.replace(/const \[visibleColumns, setVisibleColumns\] = useState\(availableColumns\.map\(c => c\.id\)\);/, `const [visibleColumns, setVisibleColumns] = useState(['id','po_no','date','supplier','material','quantity','cost','received_by']);`);

fs.writeFileSync(file, c, 'utf8');
console.log('Deliveries.jsx mapped to new schema');
