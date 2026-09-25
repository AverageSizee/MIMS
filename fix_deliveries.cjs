const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Deliveries.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. initialFormState
content = content.replace(/const initialFormState = \{[\s\S]*?\};/, `const initialFormState = {
    po_no: '',
    delivery_date: new Date().toISOString().split('T')[0],
    material_id: '',
    supplier_id: '',
    quantity: '',
    received_by: ''
  };`);

// 2. handleInputChange
content = content.replace(/const handleInputChange = \(e\) => \{[\s\S]*?else \{\s*setFormData\(\{ \.\.\.formData, \[name\]: value \}\);\s*\}\s*\};/, `const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };`);

// 3. handleEdit
content = content.replace(/const handleEdit = \(delivery\) => \{[\s\S]*?\}\);/, `const handleEdit = (delivery) => {
    setFormData({
      po_no: delivery.po_no || '',
      delivery_date: delivery.delivery_date || '',
      material_id: delivery.material_id || '',
      supplier_id: delivery.supplier_id || '',
      quantity: delivery.quantity || '',
      received_by: delivery.received_by || ''
    });
    setEditingId(delivery.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`);
// Note: removing the duplicate scrollTo that might have been matched
content = content.replace(/setEditingId\(delivery\.id\);\s*setShowForm\(true\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*setEditingId\(delivery\.id\);\s*setShowForm\(true\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/g, `setEditingId(delivery.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });`);

// 4. handleSubmit
content = content.replace(/const handleSubmit = async \(e\) => \{[\s\S]*?if \(error\) throw error;\s*\}/, `const handleSubmit = async (e) => {
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
      }`);

// 5. form elements
content = content.replace(/<form onSubmit=\{handleSubmit\}[\s\S]*?<\/form>/, `<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </form>`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Deliveries updated.');
