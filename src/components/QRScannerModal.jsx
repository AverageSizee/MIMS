import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Modal from './Modal';

export default function QRScannerModal({ isOpen, onClose, onScanned }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code">
            <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-sm text-gray-500 text-center">
                    Point your camera at the QR label. The record will be automatically created.
                </p>
                <div className="w-full rounded-xl overflow-hidden border-4 border-gray-100 bg-black min-h-[300px] relative">
                    {isOpen && (
                        <Scanner 
                            onScan={(results) => {
                                if (results && results.length > 0) {
                                    onScanned(results[0].rawValue);
                                }
                            }} 
                        />
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
}
