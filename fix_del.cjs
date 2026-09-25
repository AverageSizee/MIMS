const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Deliveries.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Replace initialFormState
content = content.replace(/const initialFormState = \{[\s\S]*?\};/m, `const initialFormState = {
    po_no: '',
    delivery_date: new Date().toISOString().split('T')[0],
    material_id: '',
    supplier_id: '',
    quantity: '',
    received_by: ''
  };`);

// 2. Replace handleSubmit
content = content.replace(/const handleSubmit = async \(e\) => \{[\s\S]*?if \(error\) throw error;[\s\n]*\}[\s\n]*\}\);[\s\n]*\}/m, `const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      const uCost = selectedMat ? Number(selectedMat.unit_cost) : 0;
      const qty = parseInt(formData.quantity);
      
      const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: qty,
        unit_cost: uCost,
        total_cost: qty * uCost,
        received_by: formData.received_by
      };

      if (editingId) {
        const { error } = await supabase.from('deliveries').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'DEL-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('deliveries').insert([{
          ...payload,
          delivery_id: generatedId,
          created_by: user.id
        }]);
        if (error) throw error;
      }
`); // NOTE: The regex needs to be extremely precise or I might just use string replacement. Let's do it safer.
