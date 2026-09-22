import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setShow(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed top-0 left-0 w-full h-[100dvh] z-[9999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
