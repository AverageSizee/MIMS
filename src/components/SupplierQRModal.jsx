import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, ChevronDown } from 'lucide-react';
import Modal from './Modal';

function QRItem({ supplier, materialDesc }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const data = JSON.stringify({ s: supplier.id, m: materialDesc });
    QRCode.toCanvas(canvasRef.current, data, {
      width: 200,
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
    <div className="flex flex-col items-center p-4 border border-gray-100 bg-white rounded-xl shadow-sm max-w-[280px] mx-auto animate-in zoom-in duration-300">
      <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
      <p className="font-bold text-gray-800 text-sm mt-3 text-center">{materialDesc}</p>
      <p className="text-xs text-gray-500 text-center mb-3">{supplier.supplier_name}</p>
      <button
        onClick={handleDownload}
        className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
      >
        <Download className="w-4 h-4" />
        Download QR Label
      </button>
    </div>
  );
}

export default function SupplierQRModal({ isOpen, onClose, supplier }) {
  const [selectedMaterial, setSelectedMaterial] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMaterial('');
    }
  }, [isOpen, supplier]);

  if (!supplier) return null;
  
  const materials = supplier.primary_materials_supplied 
    ? supplier.primary_materials_supplied.split(', ').filter(Boolean)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate QR Code`}>
      <div className="flex flex-col gap-4 py-2">
        
        {materials.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">No primary materials mapped to this supplier.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Select Material provided by {supplier.supplier_name}:</label>
               <div className="relative">
                 <select 
                   value={selectedMaterial}
                   onChange={(e) => setSelectedMaterial(e.target.value)}
                   className="w-full appearance-none border border-gray-300 rounded-lg p-2.5 bg-gray-50 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 >
                   <option value="">-- Select Material --</option>
                   {materials.map(m => (
                     <option key={m} value={m}>{m}</option>
                   ))}
                 </select>
                 <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
               </div>
            </div>

            {selectedMaterial ? (
               <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <QRItem supplier={supplier} materialDesc={selectedMaterial} />
               </div>
            ) : (
               <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  Please select a material to generate its QR code.
               </div>
            )}
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
