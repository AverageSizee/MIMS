import { useState, useRef, useEffect } from 'react';
import { Settings2 } from 'lucide-react';

export default function ColumnToggle({ columns, visibleColumns, setVisibleColumns }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (colId) => {
    if (visibleColumns.includes(colId)) {
      setVisibleColumns(visibleColumns.filter(id => id !== colId));
    } else {
      setVisibleColumns([...visibleColumns, colId]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        title="Toggle Columns"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-2">
          <div className="px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-500 uppercase">
            Visible Columns
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {columns.map(col => (
              <label key={col.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.id)}
                  onChange={() => toggleColumn(col.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
