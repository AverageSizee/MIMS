import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';
import Modal from './Modal';

export default function QRScanner({ isOpen, onClose, onScanned, title = "Scan Material QR Code" }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const startScanner = async () => {
      setError('');
      setScanning(true);
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // Success - got a scan
            onScanned(decodedText);
            stopScanner(html5QrCode);
            onClose();
          },
          () => {} // suppress error noise
        );
      } catch (err) {
        setError('Could not access camera. Please allow camera permission and try again.');
        setScanning(false);
      }
    };

    const timer = setTimeout(startScanner, 300);
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        stopScanner(scannerRef.current);
      }
    };
  }, [isOpen]);

  const stopScanner = async (instance) => {
    try {
      if (instance && instance.isScanning) {
        await instance.stop();
        await instance.clear();
      }
    } catch (_) {}
    setScanning(false);
  };

  const handleClose = () => {
    if (scannerRef.current) stopScanner(scannerRef.current);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 text-center">
          Point your camera at the QR label on the storage shelf to auto-fill the material.
        </p>

        {error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 w-full">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <div className="w-full relative">
            <div
              id="qr-reader"
              className="w-full rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '280px' }}
            />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-blue-400 rounded-lg opacity-60" style={{ width: 220, height: 220 }} />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Camera className="w-3 h-3" />
          <span>Camera feed is active — align the QR code inside the box</span>
        </div>

        <button onClick={handleClose} className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
