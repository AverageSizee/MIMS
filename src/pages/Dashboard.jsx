import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data: invData, error: invError } = await supabase
          .from('inventory_dashboard')
          .select('*')
          .order('name');
        
        if (invError) throw invError;

        const { data: matData, error: matError } = await supabase
          .from('materials')
          .select('id, unit_cost');

        if (matError) throw matError;

        const merged = (invData || []).map(i => {
          const mat = matData.find(m => m.id === i.id);
          return { ...i, unit_cost: mat ? mat.unit_cost : 0 };
        });

        setInventory(merged);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 flex justify-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-md">Error: {error}</div>;

  const totalItems = inventory.length;
  const totalValuation = inventory.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);
  
  const normalCount = inventory.filter(i => i.status === 'NORMAL').length;
  const reorderCount = inventory.filter(i => i.status === 'REORDER').length;
  const outOfStockCount = inventory.filter(i => i.status === 'OUT OF STOCK').length;
  const overstockCount = inventory.filter(i => i.status === 'OVERSTOCK').length;

  const normalPct = totalItems ? Math.round((normalCount / totalItems) * 100) : 0;
  const reorderPct = totalItems ? Math.round((reorderCount / totalItems) * 100) : 0;
  const outOfStockPct = totalItems ? Math.round((outOfStockCount / totalItems) * 100) : 0;
  const overstockPct = totalItems ? Math.round((overstockCount / totalItems) * 100) : 0;

  // Chart Data: Status
  const pieData = [
    { name: `Normal (${normalPct}%)`, value: normalCount, color: '#22c55e' },
    { name: `Reorder (${reorderPct}%)`, value: reorderCount, color: '#f59e0b' },
    { name: `Out Stock (${outOfStockPct}%)`, value: outOfStockCount, color: '#ef4444' },
    { name: `Overstock (${overstockPct}%)`, value: overstockCount, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  // Chart Data: Valuation by Category
  const catMap = {};
  inventory.forEach(item => {
    const val = item.current_stock * item.unit_cost;
    if (val > 0) {
      catMap[item.category] = (catMap[item.category] || 0) + val;
    }
  });
  const barData = Object.keys(catMap).map(c => ({
    category: c,
    value: catMap[c],
    label: `₱${(catMap[c] / 1000).toFixed(1)}K`
  })).sort((a, b) => b.value - a.value);

  // Critical Alerts List
  const criticalItems = inventory.filter(i => i.status === 'OUT OF STOCK' || i.status === 'REORDER');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">7. EXECUTIVE INVENTORY DASHBOARD VISUALIZER</h2>
          <p className="text-sm text-gray-500">Live Overview & Automated Health Metrics</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md border-l-4 border-l-blue-900 border-y border-r border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">TOTAL VALUATION</p>
          <p className="text-2xl font-bold text-gray-900">₱{totalValuation.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</p>
          <p className="text-xs text-gray-500 mt-1">{totalItems} Stock Items</p>
        </div>
        <div className="bg-white p-4 rounded-md border-l-4 border-l-green-500 border-y border-r border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">NORMAL STATUS</p>
          <p className="text-2xl font-bold text-gray-900">{normalCount} Items</p>
          <p className="text-xs text-gray-500 mt-1">{normalPct}% of Inventory</p>
        </div>
        <div className="bg-white p-4 rounded-md border-l-4 border-l-amber-500 border-y border-r border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">REORDER NEEDED</p>
          <p className="text-2xl font-bold text-gray-900">{reorderCount} Items</p>
          <p className="text-xs text-gray-500 mt-1">Action Required</p>
        </div>
        <div className="bg-white p-4 rounded-md border-l-4 border-l-red-500 border-y border-r border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">OUT OF STOCK</p>
          <p className="text-2xl font-bold text-gray-900">{outOfStockCount} Items</p>
          <p className="text-xs text-gray-500 mt-1">Critical Shortage</p>
        </div>
        <div className="bg-white p-4 rounded-md border-l-4 border-l-blue-500 border-y border-r border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">OVERSTOCK ITEM</p>
          <p className="text-2xl font-bold text-gray-900">{overstockCount} Items</p>
          <p className="text-xs text-gray-500 mt-1">Cap Exceeded</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">Inventory Status Classification Breakdown</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute right-4 md:right-12 space-y-2 text-xs font-medium text-gray-600">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: d.color }}></div>
                  {d.name}
                </div>
              ))}
            </div>
            {/* Center Label */}
            <div className="absolute font-bold text-lg text-gray-800">{totalItems} Items</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">Valuation Breakdown by Material Category (₱)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fill: '#4b5563'}} />
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="label" position="right" fill="#4b5563" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-gray-400 mt-2">Stock Value in Thousands (PHP)</p>
          </div>
        </div>
      </div>

      {/* Critical Reorder & Stockout Table */}
      <div>
        <div className="flex justify-between items-end border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase">Critical Reorder & Stockout Action List</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Filtered Dashboard Alert Table</span>
        </div>
        
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Material ID</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Material Description</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Reorder Level</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Target Level</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 text-gray-700">{item.name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-800">{item.current_stock} {item.unit_of_measurement}</td>
                    <td className="px-6 py-4 font-mono text-gray-700">{item.min_reorder_level}</td>
                    <td className="px-6 py-4 font-mono text-gray-700">{item.max_stock_level}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider uppercase
                        ${item.status === 'REORDER' ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 
                          'border-red-500 text-red-700 bg-red-50/50'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {criticalItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      All items are stocked normally. No critical shortages.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Critical Items */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {criticalItems.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 font-bold tracking-wider">ID: {item.material_id}</p>
                    <p className="font-bold text-gray-900">{item.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider uppercase
                        ${item.status === 'REORDER' ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 
                          'border-red-500 text-red-700 bg-red-50/50'}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Current</p>
                    <p className="font-mono font-bold text-gray-800">{item.current_stock} <span className="text-xs">{item.unit_of_measurement}</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Reorder</p>
                    <p className="font-mono">{item.min_reorder_level}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Target</p>
                    <p className="font-mono">{item.max_stock_level}</p>
                  </div>
                </div>
              </div>
            ))}
            {criticalItems.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                All items are stocked normally. No critical shortages.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
