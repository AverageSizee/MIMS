import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data, error } = await supabase
          .from('inventory_dashboard')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setInventory(data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-md">Error connecting to Supabase: {error}. Did you run the SQL script?</div>;

  const stats = {
    total: inventory.length,
    normal: inventory.filter(i => i.status === 'NORMAL').length,
    reorder: inventory.filter(i => i.status === 'REORDER').length,
    outOfStock: inventory.filter(i => i.status === 'OUT OF STOCK').length,
    overstock: inventory.filter(i => i.status === 'OVERSTOCK').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Package className="text-blue-600 w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Materials</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle2 className="text-green-600 w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Normal Stock</p><p className="text-2xl font-bold">{stats.normal}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-amber-100 p-3 rounded-lg"><AlertTriangle className="text-amber-600 w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Needs Reorder</p><p className="text-2xl font-bold">{stats.reorder}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-lg"><XCircle className="text-red-600 w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Out of Stock</p><p className="text-2xl font-bold">{stats.outOfStock}</p></div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Inventory Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Material ID</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Current Stock</th>
                <th className="px-6 py-3 font-medium">Min / Max</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.material_id}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4 font-medium">{item.current_stock} {item.unit_of_measurement}</td>
                  <td className="px-6 py-4 text-gray-500">{item.min_reorder_level} / {item.max_stock_level}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${item.status === 'NORMAL' ? 'bg-green-100 text-green-700' : 
                        item.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : 
                        item.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 
                        'bg-purple-100 text-purple-700'}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No materials found. Add materials to see them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
