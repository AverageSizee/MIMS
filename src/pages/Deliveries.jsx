import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Deliveries() {
  const { user, isManager } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id_date', label: 'ID / Date' },
    { id: 'material', label: 'Material' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'qty', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'po', label: 'PO / Receiver' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id));

  const initialFormState = {
    delivery_date: new Date().toISOString().split('T')[0],
    material_id: '',
    supplier_id: '',
    quantity_delivered: '',
    unit_cost: '',
    purchase_order_number: '',
    received_by: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [delRes, matRes, supRes] = await Promise.all([
        supabase.from('deliveries').select('*, materials(name), suppliers(name), creator:profiles!deliveries_created_by_fkey(full_name), updater:profiles!deliveries_updated_by_fkey(full_name)').order('created_at', { ascending: false }),
        supabase.from('materials').select('id, name, unit_cost'),
        supabase.from('suppliers').select('id, name')
      ]);
      
      setDeliveries(delRes.data || []);
      setMaterials(matRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (error) {
      console.error('Error fetching deliveries data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'material_id') {
      const selectedMat = materials.find(m => m.id === value);
      setFormData({ 
        ...formData, 
        [name]: value, 
        unit_cost: selectedMat ? selectedMat.unit_cost : formData.unit_cost 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEdit = (delivery) => {
    setFormData({
      delivery_date: delivery.delivery_date,
      material_id: delivery.material_id || '',
      supplier_id: delivery.supplier_id || '',
      quantity_delivered: delivery.quantity_delivered || '',
      unit_cost: delivery.unit_cost || '',
      purchase_order_number: delivery.purchase_order_number || '',
      received_by: delivery.received_by || ''
    });
    setEditingId(delivery.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity_delivered: parseInt(formData.quantity_delivered),
        unit_cost: parseFloat(formData.unit_cost),
        purchase_order_number: formData.purchase_order_number,
        received_by: formData.received_by
      };

      if (editingId) {
        const { error } = await supabase.from('deliveries').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'DEL-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('deliveries').insert([{
          ...payload,
          delivery_id: generatedId,
          created_by: user.id
        }]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchData(); // refresh list
    } catch (error) {
      console.error('Error saving delivery:', error.message);
      alert('Error saving delivery: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Delivery Records (Inbound)</h2>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData(initialFormState);
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Record Delivery'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
            <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Delivery' : 'Record New Delivery'}</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <select required name="material_id" value={formData.material_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
              <option value="">Select Material...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select required name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
              <option value="">Select Supplier...</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity_delivered" value={formData.quantity_delivered} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
              <input required type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
            <input required name="purchase_order_number" value={formData.purchase_order_number} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
            <input required name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Delivery' : 'Save Delivery')}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-end p-2 border-b border-gray-50">
          <ColumnToggle columns={availableColumns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
        </div>

        {loading ? (
          <div className="p-8 flex justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {visibleColumns.includes('id_date') && <th className="px-6 py-3 font-medium">ID / Date</th>}
                  {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                  {visibleColumns.includes('supplier') && <th className="px-6 py-3 font-medium">Supplier</th>}
                  {visibleColumns.includes('qty') && <th className="px-6 py-3 font-medium">Qty</th>}
                  {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                  {visibleColumns.includes('po') && <th className="px-6 py-3 font-medium">PO / Receiver</th>}
                  {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                  {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    {visibleColumns.includes('id_date') && (
                      <td className="px-6 py-4">
                        <div className="font-medium">{d.delivery_id}</div>
                        <div className="text-xs text-gray-500">{d.delivery_date}</div>
                      </td>
                    )}
                    {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{d.materials?.name}</td>}
                    {visibleColumns.includes('supplier') && <td className="px-6 py-4 text-gray-600">{d.suppliers?.name}</td>}
                    {visibleColumns.includes('qty') && <td className="px-6 py-4 font-medium">{d.quantity_delivered}</td>}
                    {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">${Number(d.total_cost).toFixed(2)}</td>}
                    {visibleColumns.includes('po') && (
                      <td className="px-6 py-4 text-gray-600">
                        <div>{d.purchase_order_number}</div>
                        <div className="text-xs">{d.received_by}</div>
                      </td>
                    )}
                    {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{d.creator?.full_name || 'System'}</td>}
                    {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{d.updater?.full_name || '-'}</td>}
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No deliveries recorded yet. Add at least 20 for your assignment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
