const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

const targetStr = `<div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">`; // wait, what was it exactly?
// Let's use robust search
const btnContainerMatch = `<div className="md:col-span-2 sm:col-span-2 flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">`;
const fallbackMatch = `mt-4 pt-4 border-t border-gray-100">`;
const flexMatch = `flex justify-end space-x-3`;

// Locate the div that contains the "Cancel" button
const cancelBtnIdx = c.indexOf(`type="button" onClick={() => { setShowForm(false);`);
if (cancelBtnIdx > -1) {
    const parentDivStart = c.lastIndexOf('<div', cancelBtnIdx);
    
    if (parentDivStart > -1 && !c.includes('Photo Attachment</label>')) {
        const fileInputStr = `\n            <div className="md:col-span-2">\n              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Attachment</label>\n              <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white" />\n              {formData.photo_url && !formData.file && (\n                <button type="button" onClick={() => setPhotoModalUrl(formData.photo_url)} className="text-blue-600 text-sm mt-2 hover:underline block text-left flex items-center gap-1">\n                  <ImageIcon className="w-4 h-4" /> View Current Attachment\n                </button>\n              )}\n            </div>\n            `;
        
        c = c.substring(0, parentDivStart) + fileInputStr + c.substring(parentDivStart);
        fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
        console.log('File input field injected into Deliveries form!');
    } else {
        console.log('Already injected or could not find parent div');
    }
} else {
    console.log('Cancel button not found in form');
}
