import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import Modal from './Modal';

export default function QRModal({ isOpen, onClose, material }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !material || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, material.material_id, {
      width: 240,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });
  }, [isOpen, material]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${material.material_id}-QR.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!material) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Material QR Code">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-6 border border-gray-100 w-full">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
          <p className="font-bold text-gray-800 text-sm mt-1">{material.material_id}</p>
          <p className="text-gray-500 text-xs text-center">{material.material_description}</p>
          <span className="text-[10px] bg-gray-200 text-gray-600 rounded px-2 py-0.5">{material.category}</span>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Stick this label on the storage shelf. Scan it when issuing or delivering this material.
        </p>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR Label
        </button>
      </div>
    </Modal>
  );
}
