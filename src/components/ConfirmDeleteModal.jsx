import Modal from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title="Confirm Deletion", itemName="this record", affectedItems=[], warningMessage="This will also automatically remove this material from the following suppliers:", isDeleting=false, extraWarnings=[] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center pb-2">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete {itemName}?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete this? This action cannot be undone.
        </p>
        
        {affectedItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 w-full text-left mb-2">
            <p className="text-sm text-amber-800 font-medium mb-1">{warningMessage}</p>
            <ul className="list-disc list-inside text-xs text-amber-700">
              {affectedItems.map((item, i) => <li key={i}>{typeof item === 'string' ? item : (item.name || item.supplier_name || item.material_description || 'Unknown')}</li>)}
            </ul>
          </div>
        )}

        {extraWarnings && extraWarnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 w-full text-left mb-6">
             <p className="text-sm text-red-800 font-medium mb-1">Warning: This record is currently referenced in:</p>
             <ul className="list-disc list-inside text-xs text-red-700">
                {extraWarnings.map((warning, i) => <li key={i}>{warning}</li>)}
             </ul>
             <p className="text-xs text-red-800 mt-2 font-medium">Deleting it may break these connected records or cause them to display missing data.</p>
          </div>
        )}
        
        <div className="flex w-full gap-3 mt-2">
          <button onClick={onClose} disabled={isDeleting} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors flex justify-center items-center">
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
