const fs = require('fs');

let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

const targetLogic = `      const quantity = parseInt(formData.quantity) || 0;
      
      const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        received_by: formData.received_by
      };`;

const targetLogicLF = targetLogic.replace(/\r\n/g, '\n');

const newLogic = `      const quantity = parseInt(formData.quantity) || 0;
      
      let finalPhotoUrl = formData.photo_url;
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
        const filePath = \`deliveries/\${fileName}\`;
        const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, formData.file);
        if (uploadError) {
            console.error('Upload error:', uploadError);
            alert('Upload failed: Please ensure the "attachments" bucket exists and is public.');
            throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
        finalPhotoUrl = publicUrl;
      }
      
      const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        received_by: formData.received_by,
        photo_url: finalPhotoUrl
      };`;

if (c.includes(targetLogic)) {
    c = c.replace(targetLogic, newLogic);
    console.log('Patched with targetLogic (CRLF)');
} else if (c.includes(targetLogicLF)) {
    c = c.replace(targetLogicLF, newLogic);
    console.log('Patched with targetLogicLF (LF)');
} else {
    // try to just find the payload definition
    const payloadStart = c.indexOf(`const payload = {`);
    if (payloadStart > -1) {
        const payloadEnd = c.indexOf(`};`, payloadStart) + 2;
        const sub = c.substring(payloadStart, payloadEnd);
        if (!sub.includes('photo_url')) {
             const manualPatch = `
      let finalPhotoUrl = formData.photo_url;
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
        const filePath = \`deliveries/\${fileName}\`;
        const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, formData.file);
        if (uploadError) {
            console.error('Upload error:', uploadError);
            alert('Upload failed: Please ensure the "attachments" bucket exists and is public.');
            throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
        finalPhotoUrl = publicUrl;
      }
      ` + sub.replace(`received_by: formData.received_by`, `received_by: formData.received_by,\n        photo_url: finalPhotoUrl`);
             
             c = c.substring(0, payloadStart) + manualPatch + c.substring(payloadEnd);
             console.log('Patched via manual payload replace');
        }
    } else {
        console.log('Could not find payload to patch');
    }
}

fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
