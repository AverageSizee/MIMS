const fs = require('fs');
const path = require('path');

function replaceBetween(content, startString, endString, replacement) {
  const startIndex = content.indexOf(startString);
  if (startIndex === -1) {
    console.log("Could not find startString: " + startString.substring(0, 50));
    return content;
  }
  const endIndex = content.indexOf(endString, startIndex);
  if (endIndex === -1) {
    console.log("Could not find endString");
    return content;
  }
  return content.substring(0, startIndex) + replacement + content.substring(endIndex + endString.length);
}

// Deliveries
let del = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Deliveries.jsx'), 'utf8');

del = replaceBetween(del, 
  "const initialFormState = {", 
  "const [formData, setFormData] = useState(initialFormState);",
  `const initialFormState = {
    po_no: '',
    delivery_date: new Date().toISOString().split('T')[0],
    material_id: '',
    supplier_id: '',
    quantity: '',
    received_by: ''
  };
  const [formData, setFormData] = useState(initialFormState);\n`
);

// Since initialFormState string above has "const [formData...]" we don't need to replace it again, but replaceBetween consumes endString. So I included it in replacement. Wait! replaceBetween consumes `endString` completely. 
// My replacement has `const [formData...` so it's correct.

del = replaceBetween(del,
  "const handleEdit = (delivery) => {",
  "setEditingId(delivery.id);",
  `const handleEdit = (delivery) => {
    setFormData({
      po_no: delivery.po_no || '',
      delivery_date: delivery.delivery_date || '',
      material_id: delivery.material_id || '',
      supplier_id: delivery.supplier_id || '',
      quantity: delivery.quantity || '',
      received_by: delivery.received_by || ''
    });
    setEditingId(delivery.id);`
);

del = replaceBetween(del,
  "const handleSubmit = async (e) => {",
  "setShowForm(false);",
  `const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      const unit_cost = selectedMat ? Number(selectedMat.unit_cost) : 0;
      const quantity = parseInt(formData.quantity) || 0;
      
      const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        received_by: formData.received_by
      };

      if (editingId) {
        const { error } = await supabase.from('deliveries').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('deliveries').select('delivery_id').order('delivery_id', { ascending: false }).limit(1);
        let newId = 'DEL-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].delivery_id) {
            const lastNum = parseInt(lastRecord[0].delivery_id.split('-')[1]);
            newId = \`DEL-\${(lastNum + 1).toString().padStart(3, '0')}\`;
        }
        
        const { error } = await supabase.from('deliveries').insert([{
          ...payload,
          delivery_id: newId,
          created_by: user.id, updated_by: user.id }]);
        if (error) throw error;
      }

      setShowForm(false);`
);

del = replaceBetween(del,
  '<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  '</form>',
  `<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO No.</label>
              <input required type="text" name="po_no" value={formData.po_no} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select required name="material_id" value={formData.material_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select required name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.supplier_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
                Cancel
              </button>
              <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
                {submitting ? 'Saving...' : (editingId ? 'Update Delivery' : 'Save Delivery')}
              </button>
            </div>
          </form>`
);
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Deliveries.jsx'), del, 'utf8');


// Issuances
let iss = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Issuances.jsx'), 'utf8');
iss = replaceBetween(iss, 
  "const initialFormState = {", 
  "const [formData, setFormData] = useState(initialFormState);",
  `const initialFormState = {
    issuance_date: new Date().toISOString().split('T')[0],
    project_site: '',
    material_id: '',
    quantity: '',
    requested_by: '',
    released_by: '',
    purpose: ''
  };
  const [formData, setFormData] = useState(initialFormState);\n`
);
iss = replaceBetween(iss,
  "const handleEdit = (issuance) => {",
  "setEditingId(issuance.id);",
  `const handleEdit = (issuance) => {
    setFormData({
      issuance_date: issuance.issuance_date || '',
      project_site: issuance.project_site || '',
      material_id: issuance.material_id || '',
      quantity: issuance.quantity || '',
      requested_by: issuance.requested_by || '',
      released_by: issuance.released_by || '',
      purpose: issuance.purpose || ''
    });
    setEditingId(issuance.id);`
);
iss = replaceBetween(iss,
  "const handleSubmit = async (e) => {",
  "setShowForm(false);",
  `const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      const unit_cost = selectedMat ? Number(selectedMat.unit_cost) : 0;
      const quantity = parseInt(formData.quantity) || 0;
      
      const payload = {
        issuance_date: formData.issuance_date,
        project_site: formData.project_site,
        material_id: formData.material_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        requested_by: formData.requested_by,
        released_by: formData.released_by,
        purpose: formData.purpose
      };

      if (editingId) {
        const { error } = await supabase.from('issuances').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('issuances').select('issuance_id').order('issuance_id', { ascending: false }).limit(1);
        let newId = 'ISS-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].issuance_id) {
            const lastNum = parseInt(lastRecord[0].issuance_id.split('-')[1]);
            newId = \`ISS-\${(lastNum + 1).toString().padStart(3, '0')}\`;
        }
        
        const { error } = await supabase.from('issuances').insert([{
          ...payload,
          issuance_id: newId,
          created_by: user.id, updated_by: user.id }]);
        if (error) throw error;
      }

      setShowForm(false);`
);
iss = replaceBetween(iss,
  '<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  '</form>',
  `<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" name="issuance_date" value={formData.issuance_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site</label>
              <input required type="text" name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select required name="material_id" value={formData.material_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input required type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <input required type="text" name="requested_by" value={formData.requested_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Released By</label>
              <input required type="text" name="released_by" value={formData.released_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
                Cancel
              </button>
              <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
                {submitting ? 'Saving...' : (editingId ? 'Update Issuance' : 'Save Issuance')}
              </button>
            </div>
          </form>`
);
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Issuances.jsx'), iss, 'utf8');


// Returns
let ret = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Returns.jsx'), 'utf8');
ret = replaceBetween(ret, 
  "const initialFormState = {", 
  "const [formData, setFormData] = useState(initialFormState);",
  `const initialFormState = {
    return_date: new Date().toISOString().split('T')[0],
    project_site: '',
    material_id: '',
    quantity: '',
    returned_by: '',
    received_by: '',
    reason_condition: ''
  };
  const [formData, setFormData] = useState(initialFormState);\n`
);
ret = replaceBetween(ret,
  "const handleEdit = (returnRecord) => {",
  "setEditingId(returnRecord.id);",
  `const handleEdit = (returnRecord) => {
    setFormData({
      return_date: returnRecord.return_date || '',
      project_site: returnRecord.project_site || '',
      material_id: returnRecord.material_id || '',
      quantity: returnRecord.quantity || '',
      returned_by: returnRecord.returned_by || '',
      received_by: returnRecord.received_by || '',
      reason_condition: returnRecord.reason_condition || ''
    });
    setEditingId(returnRecord.id);`
);
ret = replaceBetween(ret,
  "const handleSubmit = async (e) => {",
  "setShowForm(false);",
  `const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      const unit_cost = selectedMat ? Number(selectedMat.unit_cost) : 0;
      const quantity = parseInt(formData.quantity) || 0;
      
      const payload = {
        return_date: formData.return_date,
        project_site: formData.project_site,
        material_id: formData.material_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        returned_by: formData.returned_by,
        received_by: formData.received_by,
        reason_condition: formData.reason_condition
      };

      if (editingId) {
        const { error } = await supabase.from('returns').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('returns').select('return_id').order('return_id', { ascending: false }).limit(1);
        let newId = 'RET-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].return_id) {
            const lastNum = parseInt(lastRecord[0].return_id.split('-')[1]);
            newId = \`RET-\${(lastNum + 1).toString().padStart(3, '0')}\`;
        }
        
        const { error } = await supabase.from('returns').insert([{
          ...payload,
          return_id: newId,
          created_by: user.id, updated_by: user.id }]);
        if (error) throw error;
      }

      setShowForm(false);`
);
ret = replaceBetween(ret,
  '<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  '</form>',
  `<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" name="return_date" value={formData.return_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site</label>
              <input required type="text" name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select required name="material_id" value={formData.material_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason & Condition</label>
              <input required type="text" name="reason_condition" value={formData.reason_condition} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returned By</label>
              <input required type="text" name="returned_by" value={formData.returned_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
                Cancel
              </button>
              <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
                {submitting ? 'Saving...' : (editingId ? 'Update Return' : 'Save Return')}
              </button>
            </div>
          </form>`
);
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Returns.jsx'), ret, 'utf8');

// Materials payload
let mat = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Materials.jsx'), 'utf8');
mat = mat.replace(/min_reorder_level: parseInt\(formData\.min_reorder_level\)/g, 'reorder_level: parseInt(formData.reorder_level)');
mat = mat.replace(/max_stock_level: parseInt\(formData\.max_stock_level\)/g, 'target_level: parseInt(formData.target_level)');
mat = mat.replace(/name="min_reorder_level"/g, 'name="reorder_level"');
mat = mat.replace(/value=\{formData\.min_reorder_level\}/g, 'value={formData.reorder_level}');
mat = mat.replace(/name="max_stock_level"/g, 'name="target_level"');
mat = mat.replace(/value=\{formData\.max_stock_level\}/g, 'value={formData.target_level}');

mat = replaceBetween(mat,
  "const generatedId = 'MAT-' + Math.floor(10000 + Math.random() * 90000);",
  "if (error) throw error;",
  `const { data: lastRecord } = await supabase.from('materials').select('material_id').order('material_id', { ascending: false }).limit(1);
          let generatedId = 'MAT-001';
          if (lastRecord && lastRecord.length > 0 && lastRecord[0].material_id) {
              const lastNum = parseInt(lastRecord[0].material_id.split('-')[1]);
              generatedId = \`MAT-\${(lastNum + 1).toString().padStart(3, '0')}\`;
          }
          const { error } = await supabase.from('materials').insert([{
            ...payload,
            material_id: generatedId,
            created_by: user.id, updated_by: user.id }]);
          if (error) throw error;`
);
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Materials.jsx'), mat, 'utf8');

console.log('All forms rewritten successfully.');
