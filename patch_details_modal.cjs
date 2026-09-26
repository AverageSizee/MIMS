const fs = require('fs');

let form = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

// 1. Add selectedRecord state
if (!form.includes('selectedRecord')) {
    form = form.replace(`const [editingId, setEditingId] = useState(null);`, `const [editingId, setEditingId] = useState(null);\n  const [selectedRecord, setSelectedRecord] = useState(null);`);
}

// 2. Hide photo_url from default visibleColumns
const defaultColsStr = `filter(id => !['created_by', 'updated_by', 'created_at'].includes(id))`;
if (form.includes(defaultColsStr)) {
    form = form.replace(defaultColsStr, `filter(id => !['created_by', 'updated_by', 'created_at', 'photo_url'].includes(id))`);
}

// 3. Make rows clickable (Desktop)
const desktopRowOld = `<tr key={d.id} className="hover:bg-gray-50">`;
const desktopRowNew = `<tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRecord(d)}>`;
if (form.includes(desktopRowOld)) form = form.replace(desktopRowOld, desktopRowNew);

// 4. Make rows clickable (Mobile)
const mobileRowOld = `<div key={d.id} className="p-4 space-y-3">`;
const mobileRowNew = `<div key={d.id} className="p-4 space-y-3 cursor-pointer" onClick={() => setSelectedRecord(d)}>`;
if (form.includes(mobileRowOld)) form = form.replace(mobileRowOld, mobileRowNew);

// 5. Add stopPropagation to View Photo buttons
const viewPhotoOld = `onClick={() => setPhotoModalUrl(d.photo_url)}`;
const viewPhotoNew = `onClick={(e) => { e.stopPropagation(); setPhotoModalUrl(d.photo_url); }}`;
// Replace globally since it appears twice (desktop and mobile)
form = form.split(viewPhotoOld).join(viewPhotoNew);

// 6. Add stopPropagation to Edit buttons
const editBtnOld = `onClick={() => handleEdit(d)}`;
const editBtnNew = `onClick={(e) => { e.stopPropagation(); handleEdit(d); }}`;
form = form.split(editBtnOld).join(editBtnNew);

// 7. Add stopPropagation to Delete buttons
const delBtnOld = `onClick={() => { setEditingId(d.id); setShowDeleteConfirm(true); }}`;
const delBtnNew = `onClick={(e) => { e.stopPropagation(); setEditingId(d.id); setShowDeleteConfirm(true); }}`;
form = form.split(delBtnOld).join(delBtnNew);

// 8. Add Details Modal Component
const detailsModal = `\n      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Delivery Details">
        {selectedRecord && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Delivery ID</p>
                <p className="font-medium text-gray-900">{selectedRecord.delivery_id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">PO No.</p>
                <p className="font-medium text-gray-900">{selectedRecord.po_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium text-gray-900">{selectedRecord.delivery_date}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Received By</p>
                <p className="font-medium text-gray-900">{selectedRecord.received_by}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Material</p>
                <p className="font-medium text-gray-900">{selectedRecord.materials?.material_description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Supplier</p>
                <p className="font-medium text-gray-900">{selectedRecord.suppliers?.supplier_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Quantity</p>
                <p className="font-medium text-gray-900">{selectedRecord.quantity}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Cost</p>
                <p className="font-medium text-gray-900">₱{selectedRecord.total_cost?.toLocaleString()}</p>
              </div>
            </div>
            
            {selectedRecord.photo_url && (
              <div className="mt-4 border-t pt-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photo Attachment</p>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-center">
                  <img src={selectedRecord.photo_url} alt="Delivery Attachment" className="max-h-64 rounded-md object-contain" />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4 border-t mt-6">
              <button onClick={() => setSelectedRecord(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Close
              </button>
              <button onClick={() => { handleEdit(selectedRecord); setSelectedRecord(null); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Record
              </button>
            </div>
          </div>
        )}
      </Modal>\n`;

const endOfFileIdx = form.lastIndexOf('</Suspense>');
if (endOfFileIdx > -1 && !form.includes('Delivery Details')) {
    form = form.substring(0, endOfFileIdx) + detailsModal + form.substring(endOfFileIdx);
}

fs.writeFileSync('src/pages/Deliveries.jsx', form, 'utf8');
console.log('Deliveries.jsx patched with Details modal successfully!');
