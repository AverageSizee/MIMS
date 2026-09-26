import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowLeftRight } from 'lucide-react';

export default function Scan() {
    const [scannedId, setScannedId] = useState(null);
    const navigate = useNavigate();

    const handleScan = (results) => {
        if (results && results.length > 0 && results[0].rawValue) {
            setScannedId(results[0].rawValue);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Scan Material QR</h2>
            
            {!scannedId ? (
                <div className="rounded-xl overflow-hidden border-4 border-blue-100 shadow-lg bg-black relative min-h-[300px]">
                    <Scanner onScan={handleScan} />
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
                        Point camera at the shelf label
                    </p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider">Scanned Material</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{scannedId}</p>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-2"></div>
                    
                    <h3 className="font-medium text-gray-800 text-center">What would you like to do?</h3>
                    
                    <button onClick={() => navigate(`/deliveries?material=${scannedId}`)} className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100 shadow-sm">
                        <Truck className="w-6 h-6 mr-4 shrink-0" />
                        <div className="text-left"><p className="font-bold">Receive Delivery</p><p className="text-xs opacity-80">Add incoming stock for this material</p></div>
                    </button>
                    
                    <button onClick={() => navigate(`/issuances?material=${scannedId}`)} className="flex items-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors border border-orange-100 shadow-sm">
                        <Package className="w-6 h-6 mr-4 shrink-0" />
                        <div className="text-left"><p className="font-bold">Issue Material</p><p className="text-xs opacity-80">Dispatch stock out for use</p></div>
                    </button>

                    <button onClick={() => navigate(`/returns?material=${scannedId}`)} className="flex items-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100 shadow-sm">
                        <ArrowLeftRight className="w-6 h-6 mr-4 shrink-0" />
                        <div className="text-left"><p className="font-bold">Return Material</p><p className="text-xs opacity-80">Log unused stock being returned</p></div>
                    </button>
                    
                    <button onClick={() => setScannedId(null)} className="mt-4 p-3 text-gray-500 hover:text-gray-800 font-medium bg-gray-50 rounded-lg border border-gray-200">
                        Scan Another Code
                    </button>
                </div>
            )}
        </div>
    );
}
