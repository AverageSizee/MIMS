const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Issuances.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. initialFormState
content = content.replace(/const initialFormState = \{[\s\S]*?\};/, `const initialFormState = {
    issuance_date: new Date().toISOString().split('T')[0],
    project_site: '',
    material_id: '',
    quantity: '',
    requested_by: '',
    released_by: '',
    purpose: ''
  };`);

// 2. handleInputChange
content = content.replace(/const handleInputChange = \(e\) => \{[\s\S]*?else \{\s*setFormData\(\{ \.\.\.formData, \[name\]: value \}\);\s*\}\s*\};/, `const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };`);

// 3. handleEdit
content = content.replace(/const handleEdit = \(issuance\) => \{[\s\S]*?\}\);/, `const handleEdit = (issuance) => {
    setFormData({
      issuance_date: issuance.issuance_date || '',
      project_site: issuance.project_site || '',
      material_id: issuance.material_id || '',
      quantity: issuance.quantity || '',
      requested_by: issuance.requested_by || '',
      released_by: issuance.released_by || '',
      purpose: issuance.purpose || ''
    });
    setEditingId(issuance.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`);
content = content.replace(/setEditingId\(issuance\.id\);\s*setShowForm\(true\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*setEditingId\(issuance\.id\);\s*setShowForm\(true\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/g, `setEditingId(issuance.id);
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
      }`);

// 5. form elements
content = content.replace(/<form onSubmit=\{handleSubmit\}[\s\S]*?<\/form>/, `<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </form>`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Issuances updated.');
