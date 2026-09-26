const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

// 1. Add ImageIcon to lucide-react import
const lucideImport = `import { Plus, Loader2, Edit2, Trash2, MapPin } from 'lucide-react';`;
const lucideImportAlt = `import { Plus, Loader2, Edit2 , Trash2 } from 'lucide-react';`;
if (c.includes(lucideImport)) {
    c = c.replace(lucideImport, `import { Plus, Loader2, Edit2, Trash2, MapPin, ImageIcon } from 'lucide-react';`);
} else if (c.includes(lucideImportAlt)) {
    c = c.replace(lucideImportAlt, `import { Plus, Loader2, Edit2, Trash2, ImageIcon } from 'lucide-react';`);
}

// 2. Add state
const stateMarker = `const [editingId, setEditingId] = useState(null);`;
if (c.includes(stateMarker) && !c.includes('photoModalUrl')) {
    c = c.replace(stateMarker, stateMarker + `\n  const [photoModalUrl, setPhotoModalUrl] = useState(null);`);
}

// 3. Update initialFormState
const formStateMarker = `received_by: ''`;
if (c.includes(formStateMarker) && !c.includes('photo_url:')) {
    c = c.replace(formStateMarker, `received_by: '',\n    photo_url: '',\n    file: null`);
}

// 4. Add 'photo_url' to availableColumns
const colMarker = `{ id: 'received_by', label: 'Received By' }`;
if (c.includes(colMarker) && !c.includes(`id: 'photo_url'`)) {
    c = c.replace(colMarker, colMarker + `,\n    { id: 'photo_url', label: 'Attachment' }`);
}

// 5. Update form layout (add the file input)
const formSubmitMarker = `<div className="md:col-span-2 mt-4 flex justify-end space-x-3">`;
if (c.includes(formSubmitMarker) && !c.includes('Photo Attachment')) {
    const fileInputStr = `
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Attachment</label>
              <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} className="w-full border border-gray-300 rounded-md p-1.5 text-sm" />
              {formData.photo_url && !formData.file && (
                <button type="button" onClick={() => setPhotoModalUrl(formData.photo_url)} className="text-blue-600 text-sm mt-1 hover:underline block text-left">
                  View Current Attachment
                </button>
              )}
            </div>
            `;
    c = c.replace(formSubmitMarker, fileInputStr + formSubmitMarker);
}

// 6. Update handleSubmit logic
const payloadMarker = `const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: formData.quantity,
        unit_cost: mat.unit_cost,
        total_cost: parseFloat(formData.quantity) * parseFloat(mat.unit_cost),
        received_by: formData.received_by
      };`;
const newPayloadLogic = `
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
        quantity: formData.quantity,
        unit_cost: mat.unit_cost,
        total_cost: parseFloat(formData.quantity) * parseFloat(mat.unit_cost),
        received_by: formData.received_by,
        photo_url: finalPhotoUrl
      };`;
if (c.includes(payloadMarker)) {
    c = c.replace(payloadMarker, newPayloadLogic);
} else {
    // maybe CRLF
    const payloadCRLF = payloadMarker.replace(/\n/g, '\r\n');
    if (c.includes(payloadCRLF)) {
        c = c.replace(payloadCRLF, newPayloadLogic.replace(/\n/g, '\r\n'));
    }
}

// 7. Render in desktop table
const desktopColMarker = `{visibleColumns.includes('received_by') && <td className="px-6 py-4">{d.received_by}</td>}`;
const desktopColNew = `{visibleColumns.includes('received_by') && <td className="px-6 py-4">{d.received_by}</td>}
                          {visibleColumns.includes('photo_url') && (
                            <td className="px-6 py-4">
                              {d.photo_url ? (
                                <button onClick={() => setPhotoModalUrl(d.photo_url)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                                  <ImageIcon className="w-4 h-4 mr-1" />
                                  <span className="text-sm underline">View Photo</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">None</span>
                              )}
                            </td>
                          )}`;
if (c.includes(desktopColMarker) && !c.includes(`visibleColumns.includes('photo_url')`)) {
    c = c.replace(desktopColMarker, desktopColNew);
}

// 8. Render in mobile view
const mobileColMarker = `{visibleColumns.includes('received_by') && (
                        <div>
                          <span className="block text-gray-500 mb-1">Received By</span>
                          <span className="font-medium">{d.received_by}</span>
                        </div>
                      )}`;
const mobileColNew = `{visibleColumns.includes('received_by') && (
                        <div>
                          <span className="block text-gray-500 mb-1">Received By</span>
                          <span className="font-medium">{d.received_by}</span>
                        </div>
                      )}
                      {visibleColumns.includes('photo_url') && d.photo_url && (
                        <div>
                          <span className="block text-gray-500 mb-1">Attachment</span>
                          <button onClick={() => setPhotoModalUrl(d.photo_url)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mt-1">
                            <ImageIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm underline">View Photo</span>
                          </button>
                        </div>
                      )}`;
if (c.includes(mobileColMarker) && !c.includes(`visibleColumns.includes('photo_url') && d.photo_url`)) {
    c = c.replace(mobileColMarker, mobileColNew);
} else if (c.includes(mobileColMarker.replace(/\n/g, '\r\n'))) {
    c = c.replace(mobileColMarker.replace(/\n/g, '\r\n'), mobileColNew.replace(/\n/g, '\r\n'));
}

// 9. Add handleEdit logic
const editMarker = `received_by: delivery.received_by || ''`;
if (c.includes(editMarker) && !c.includes('photo_url: delivery.photo_url')) {
    c = c.replace(editMarker, editMarker + `,\n      photo_url: delivery.photo_url || '',\n      file: null`);
}

// 10. Add Photo Modal at the end
const finalModalMarker = `</Suspense>\r\n    </div>\r\n  );\r\n}`;
const finalModalLF = `</Suspense>\n    </div>\n  );\n}`;
const newModal = `</Suspense>\n      <Modal isOpen={!!photoModalUrl} onClose={() => setPhotoModalUrl(null)} title="Photo Attachment">\n        <div className="p-2 flex justify-center bg-gray-50 rounded-lg min-h-[200px] items-center">\n          {photoModalUrl ? (\n            <img src={photoModalUrl} alt="Attachment" className="max-w-full max-h-[70vh] rounded-lg shadow-sm" />\n          ) : (\n            <p className="text-gray-500 text-sm">No photo available</p>\n          )}\n        </div>\n        <button onClick={() => setPhotoModalUrl(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">Close</button>\n      </Modal>\n    </div>\n  );\n}`;

if (c.includes(finalModalMarker) && !c.includes('Photo Attachment')) {
    c = c.replace(finalModalMarker, newModal.replace(/\n/g, '\r\n'));
} else if (c.includes(finalModalLF) && !c.includes('Photo Attachment')) {
    c = c.replace(finalModalLF, newModal);
}

fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
console.log('Deliveries.jsx fully patched for photo uploads!');
