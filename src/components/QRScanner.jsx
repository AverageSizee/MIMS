import { Scanner } from '@yudiel/react-qr-scanner';
import { X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

export default function QRScanner({ isOpen, onClose, onScanned }) {
  const [error, setError] = useState('');

  const handleScan = (results) => {
    if (results && results.length > 0) {
      const text = results[0].rawValue;
      if (text) {
        onScanned(text);
        onClose();
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Could not access camera. Please allow camera permission and try again.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Material QR Code">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 text-center">
          Point your camera at the QR label on the storage shelf to auto-fill the material.
        </p>

        {error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 w-full">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : isOpen ? (
          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              styles={{ container: { width: '100%', height: '280px' } }}
            />
          </div>
        ) : null}

        <p className="text-xs text-gray-400 flex items-center gap-1">
          📷 Align the QR code label within the camera frame
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
