import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import Modal from './Modal';

function QRItem({ supplier, materialDesc }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const data = JSON.stringify({ s: supplier.id, m: materialDesc });
    QRCode.toCanvas(canvasRef.current, data, {
      width: 140,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });
  }, [supplier, materialDesc]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${supplier.supplier_name}-${materialDesc}-QR.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-3 border border-gray-100 bg-white rounded-xl shadow-sm">
      <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
      <p className="font-bold text-gray-800 text-xs mt-2 text-center line-clamp-2" title={materialDesc}>{materialDesc}</p>
      <button
        onClick={handleDownload}
        className="mt-2 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium transition-colors w-full justify-center"
      >
        <Download className="w-3 h-3" />
        Download
      </button>
    </div>
  );
}

export default function SupplierQRModal({ isOpen, onClose, supplier }) {
  if (!supplier) return null;
  
  const materials = supplier.primary_materials_supplied 
    ? supplier.primary_materials_supplied.split(', ').filter(Boolean)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Codes for ${supplier.supplier_name}`}>
      <div className="flex flex-col gap-4 py-2">
        <p className="text-xs text-gray-500 text-center">
          These QR codes encode both the Supplier ({supplier.supplier_name}) and the specific Material. Stick them on the incoming materials or shelves.
        </p>
        
        {materials.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">No primary materials mapped to this supplier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {materials.map(m => (
              <QRItem key={m} supplier={supplier} materialDesc={m} />
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
