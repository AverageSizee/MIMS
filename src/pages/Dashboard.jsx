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
          .order('material_description');
        
        if (invError) throw invError;

        setInventory(invData || []);
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
  const totalValuation = inventory.reduce((sum, item) => sum + (item.stock_balance * item.unit_cost), 0);
  
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
    const val = item.stock_balance * item.unit_cost;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase">Executive Inventory Dashboard</h2>
          <p className="text-sm text-gray-500">Live Overview & Automated Health Metrics</p>
        </div>
      </div>

      {/* KPI Cards Row - Mobile Friendly Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="col-span-2 lg:col-span-1 bg-white p-3 md:p-4 rounded-md border-l-4 border-l-blue-900 border-y border-r border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase truncate">Total Valuation</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">₱{totalValuation.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</p>
          <p className="text-xs text-gray-500 mt-1">{totalItems} Stock Items</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-md border-l-4 border-l-green-500 border-y border-r border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase truncate">Normal</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{normalCount} Items</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1">{normalPct}% of Inventory</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-md border-l-4 border-l-amber-500 border-y border-r border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase truncate">Reorder</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{reorderCount} Items</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1 truncate">Action Required</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-md border-l-4 border-l-red-500 border-y border-r border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase truncate">Out of Stock</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{outOfStockCount} Items</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1 truncate">Critical Shortage</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-md border-l-4 border-l-blue-500 border-y border-r border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase truncate">Overstock</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{overstockCount} Items</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1 truncate">Cap Exceeded</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">Inventory Status Classification Breakdown</h3>
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
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
            <div className="absolute right-0 md:right-8 top-1/2 -translate-y-1/2 space-y-3 text-[10px] md:text-xs font-medium text-gray-600 bg-white/80 p-2 rounded z-10 pointer-events-none">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }}></div>
                  {d.name}
                </div>
              ))}
            </div>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg text-gray-800 flex flex-col items-center justify-center pointer-events-none">
              <span>{totalItems}</span>
              <span className="text-xs font-normal text-gray-500">Items</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">Valuation Breakdown by Category (₱)</h3>
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 35, left: 0, bottom: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} width={85} tick={{fontSize: 10, fill: '#4b5563'}} />
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="label" position="right" fill="#4b5563" fontSize={10} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-[10px] text-gray-400 absolute bottom-0 left-0 right-0">Stock Value in Thousands (PHP)</p>
          </div>
        </div>
      </div>

      {/* Critical Reorder & Stockout Table */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-2 mb-4 gap-2">
          <h2 className="text-lg font-bold text-gray-800 uppercase">Critical Action List</h2>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded bg-gray-50">Filtered Dashboard Alert Table</span>
        </div>
        
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-md">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Material ID</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Material Description</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Current Stock</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Reorder Level</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Target Level</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 text-gray-700">{item.material_description}</td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-800 text-right">{item.stock_balance} <span className="text-xs text-gray-500">{item.unit_of_measurement}</span></td>
                    <td className="px-6 py-4 font-mono text-gray-700 text-right">{item.reorder_level}</td>
                    <td className="px-6 py-4 font-mono text-gray-700 text-right">{item.target_level}</td>
                    <td className="px-6 py-4 text-center">
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
                    <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ID: {item.material_id}</p>
                    <p className="font-bold text-gray-900 text-sm leading-tight mt-1">{item.material_description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider uppercase shrink-0 ml-2
                        ${item.status === 'REORDER' ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 
                          'border-red-500 text-red-700 bg-red-50/50'}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm bg-gray-50 p-2 rounded-md border border-gray-100">
                  <div className="flex flex-col">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Current</p>
                    <p className="font-mono font-bold text-gray-800">{item.stock_balance} <span className="text-[10px] text-gray-500">{item.unit_of_measurement}</span></p>
                  </div>
                  <div className="flex flex-col border-l border-gray-200">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Reorder</p>
                    <p className="font-mono text-gray-700">{item.reorder_level}</p>
                  </div>
                  <div className="flex flex-col border-l border-gray-200">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Target</p>
                    <p className="font-mono text-gray-700">{item.target_level}</p>
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
