const fs = require('fs');

let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

// 1. Add X to lucide-react imports
if (!c.includes('X } from')) {
    c = c.replace(/ImageIcon } from 'lucide-react';/, `ImageIcon, X } from 'lucide-react';`);
}

// 2. initialFormState update
c = c.replace(/file: null/g, `files: []`);

// 3. Form input replacement
const oldInput = `<div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Attachment</label>
              <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white" />
              {formData.photo_url && !formData.file && (
                <button type="button" onClick={() => setPhotoModalUrl(formData.photo_url)} className="text-blue-600 text-sm mt-2 hover:underline block text-left flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> View Current Attachment
                </button>
              )}
            </div>`;

const newInput = `<div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Attachments</label>
              <input type="file" multiple accept="image/*" onChange={(e) => {
                 if(e.target.files.length) {
                    setFormData(prev => ({ ...prev, files: [...(prev.files || []), ...Array.from(e.target.files)] }));
                 }
              }} className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white" />
              
              <div className="mt-3 space-y-2">
                {formData.photo_url && formData.photo_url.split(',').filter(Boolean).map((url, idx) => {
                   const fileName = url.split('/').pop();
                   return (
                     <div key={url} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-lg border border-blue-100">
                       <button type="button" onClick={() => setPhotoModalUrl(url)} className="text-blue-700 hover:underline flex items-center gap-2 truncate flex-1 text-left font-medium">
                         <ImageIcon className="w-4 h-4 shrink-0" /> <span className="truncate">{fileName}</span>
                       </button>
                       <button type="button" onClick={() => {
                          const newUrls = formData.photo_url.split(',').filter(Boolean).filter(u => u !== url).join(',');
                          setFormData(prev => ({ ...prev, photo_url: newUrls }));
                       }} className="text-red-500 p-1 hover:bg-red-100 rounded-md transition-colors" title="Remove attachment">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   );
                })}
                {formData.files && formData.files.length > 0 && formData.files.map((f, idx) => (
                     <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                       <ImageIcon className="w-4 h-4 shrink-0 text-gray-500" />
                       <span className="truncate flex-1 text-gray-700">{f.name}</span>
                       <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">Pending</span>
                       <button type="button" onClick={() => {
                          const newFiles = [...formData.files];
                          newFiles.splice(idx, 1);
                          setFormData(prev => ({ ...prev, files: newFiles }));
                       }} className="text-red-500 p-1 hover:bg-red-100 rounded-md transition-colors" title="Remove file">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                ))}
              </div>
            </div>`;

if (c.includes(oldInput)) {
    c = c.replace(oldInput, newInput);
} else if (c.includes(oldInput.replace(/\n/g, '\r\n'))) {
    c = c.replace(oldInput.replace(/\n/g, '\r\n'), newInput.replace(/\n/g, '\r\n'));
}

// 4. handleSubmit upload logic replacement
const oldSubmit = `let finalPhotoUrl = formData.photo_url;
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
      }`;

const newSubmit = `let finalUrls = formData.photo_url ? formData.photo_url.split(',').filter(Boolean) : [];
      if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
          const filePath = \`deliveries/\${fileName}\`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
          if (uploadError) {
              console.error('Upload error:', uploadError);
              alert('Upload failed: Please ensure the "attachments" bucket exists and is public.');
              throw uploadError;
          }
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          finalUrls.push(publicUrl);
        }
      }`;

if (c.includes(oldSubmit)) {
    c = c.replace(oldSubmit, newSubmit);
    c = c.replace(`photo_url: finalPhotoUrl`, `photo_url: finalUrls.join(',')`);
} else if (c.includes(oldSubmit.replace(/\n/g, '\r\n'))) {
    c = c.replace(oldSubmit.replace(/\n/g, '\r\n'), newSubmit.replace(/\n/g, '\r\n'));
    c = c.replace(`photo_url: finalPhotoUrl`, `photo_url: finalUrls.join(',')`);
}

// 5. Details Modal - Render multiple images as buttons
const oldDetails = `<div className="col-span-2 border-t pt-4 mt-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photo Attachment</p>
                {selectedRecord.photo_url ? (
                  <button onClick={(e) => { e.stopPropagation(); setPhotoModalUrl(selectedRecord.photo_url); }} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-full justify-center font-medium">
                    <ImageIcon className="w-4 h-4" /> View Attached Photo
                  </button>
                ) : (
                  <div className="bg-gray-50 text-gray-400 text-sm p-4 rounded-lg text-center border border-dashed border-gray-200">
                    No photo attached
                  </div>
                )}
              </div>`;

const newDetails = `<div className="col-span-2 border-t pt-4 mt-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photo Attachments</p>
                {selectedRecord.photo_url ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecord.photo_url.split(',').filter(Boolean).map((url, idx) => (
                      <button key={idx} onClick={(e) => { e.stopPropagation(); setPhotoModalUrl(url); }} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors justify-center font-medium truncate">
                        <ImageIcon className="w-4 h-4 shrink-0" /> <span className="truncate">View Photo {idx+1}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 text-gray-400 text-sm p-4 rounded-lg text-center border border-dashed border-gray-200">
                    No photos attached
                  </div>
                )}
              </div>`;

if (c.includes(oldDetails)) {
    c = c.replace(oldDetails, newDetails);
} else if (c.includes(oldDetails.replace(/\n/g, '\r\n'))) {
    c = c.replace(oldDetails.replace(/\n/g, '\r\n'), newDetails.replace(/\n/g, '\r\n'));
}

// 6. Update Desktop and Mobile columns for "X Files"
const deskOldCol = `{d.photo_url ? (
                                <button onClick={() => setPhotoModalUrl(d.photo_url)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                                  <ImageIcon className="w-4 h-4 mr-1" />
                                  <span className="text-sm underline">View Photo</span>
                                </button>
                              ) : (`;
const deskNewCol = `{d.photo_url ? (
                                <span className="flex items-center text-blue-600">
                                  <ImageIcon className="w-4 h-4 mr-1" />
                                  <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                                </span>
                              ) : (`;
if (c.includes(deskOldCol)) c = c.replace(deskOldCol, deskNewCol);
else if (c.includes(deskOldCol.replace(/\n/g, '\r\n'))) c = c.replace(deskOldCol.replace(/\n/g, '\r\n'), deskNewCol.replace(/\n/g, '\r\n'));

const mobOldCol = `      <button onClick={() => setPhotoModalUrl(d.photo_url)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mt-1">
                            <ImageIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm underline">View Photo</span>
                          </button>`;
const mobNewCol = `      <span className="flex items-center text-blue-600 mt-1">
                            <ImageIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                          </span>`;
if (c.includes(mobOldCol)) c = c.replace(mobOldCol, mobNewCol);
else if (c.includes(mobOldCol.replace(/\n/g, '\r\n'))) c = c.replace(mobOldCol.replace(/\n/g, '\r\n'), mobNewCol.replace(/\n/g, '\r\n'));


fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
console.log('Multiple photo attachments support added!');
