const fs = require('fs');

let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');

// 1. Update Details Modal Photo Attachment Layout
const detailsPhotoOld = `{selectedRecord.photo_url && (
              <div className="mt-4 border-t pt-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photo Attachment</p>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-center">
                  <img src={selectedRecord.photo_url} alt="Delivery Attachment" className="max-h-64 rounded-md object-contain" />
                </div>
              </div>
            )}`;
const detailsPhotoNew = `<div className="col-span-2 border-t pt-4 mt-2">
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

if (c.includes(detailsPhotoOld)) {
    c = c.replace(detailsPhotoOld, detailsPhotoNew);
} else if (c.includes(detailsPhotoOld.replace(/\n/g, '\r\n'))) {
    c = c.replace(detailsPhotoOld.replace(/\n/g, '\r\n'), detailsPhotoNew.replace(/\n/g, '\r\n'));
} else {
    console.log('Details photo old structure not found!');
}

// 2. Add or Update the Photo Modal
const photoModalCode = `
      <Modal isOpen={!!photoModalUrl} onClose={() => setPhotoModalUrl(null)} title="Photo Attachment">
        <div className="p-2 flex justify-center bg-gray-50 rounded-lg min-h-[200px] items-center">
          {photoModalUrl ? (
            <img src={photoModalUrl} alt="Attachment" className="max-w-full max-h-[70vh] rounded-lg shadow-sm animate-in zoom-in duration-300" />
          ) : (
            <p className="text-gray-500 text-sm">No photo available</p>
          )}
        </div>
        <button onClick={() => setPhotoModalUrl(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">Close</button>
      </Modal>
`;

if (!c.includes('isOpen={!!photoModalUrl}')) {
    const endStr = `    </div>\r\n  );\r\n}`;
    const endStrLF = `    </div>\n  );\n}`;
    if (c.includes(endStr)) {
        c = c.replace(endStr, photoModalCode.replace(/\n/g, '\r\n') + endStr);
    } else if (c.includes(endStrLF)) {
        c = c.replace(endStrLF, photoModalCode + endStrLF);
    } else {
        const lastDiv = c.lastIndexOf('</div>');
        if (lastDiv > -1) {
            c = c.substring(0, lastDiv) + photoModalCode + c.substring(lastDiv);
        }
    }
}

fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
console.log('Fixed photo modal and details layout in Deliveries!');
