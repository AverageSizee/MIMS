import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRSheetPrinter({ materials, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !materials.length) return;

    const generateAll = async () => {
      const canvases = containerRef.current.querySelectorAll('canvas');
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        const canvas = canvases[i];
        if (!canvas) continue;
        await QRCode.toCanvas(canvas, mat.material_id, {
          width: 160,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
      }
    };
    generateAll();
  }, [materials]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-auto">
      {/* Toolbar - hidden during print */}
      <div className="print:hidden sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">QR Label Sheet</h2>
          <p className="text-sm text-gray-500">Cut and stick each label on the corresponding shelf or storage bin</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            ✕ Close
          </button>
          <button onClick={handlePrint} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2">
            🖨️ Print Sheet
          </button>
        </div>
      </div>

      {/* Label Grid */}
      <div
        ref={containerRef}
        className="p-6 grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {materials.map((mat) => (
          <div
            key={mat.id}
            className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center gap-2 bg-white"
            style={{ pageBreakInside: 'avoid' }}
          >
            <canvas className="rounded" />
            <div className="text-center">
              <p className="font-bold text-xs text-gray-800 leading-tight">{mat.material_id}</p>
              <p className="text-[11px] text-gray-600 leading-tight mt-0.5 line-clamp-2">{mat.material_description}</p>
              <p className="text-[10px] text-gray-400 mt-1 bg-gray-100 rounded px-1">{mat.category}</p>
            </div>
            <p className="text-[9px] text-gray-400">MIMS — Scan to Issue / Deliver</p>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}
