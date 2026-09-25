import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 , Trash2 } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id', label: 'Delivery ID' },
    { id: 'po_no', label: 'PO No.' },
    { id: 'date', label: 'Date' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'received_by', label: 'Received By' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at'].includes(id)));

  const initialFormState = {
    po_no: '',
    received_by: '',
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
        supabase.from('deliveries').select('*, materials(material_description), suppliers(supplier_name)').order('created_at', { ascending: false }),
        supabase.from('materials').select('id, material_description, unit_cost'),
        supabase.from('suppliers').select('id, supplier_name')
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
        po_no: delivery.po_no,
        received_by: delivery.received_by,
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
          po_no: formData.po_no,
          received_by: formData.received_by,
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
          created_by: user.id, updated_by: user.id }]);
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

  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('deliveries').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchDeliveries();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Delivery Records (Inbound)</h2>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData(initialFormState);
            } else {
              setFormData(initialFormState);
              setShowForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Record Delivery'}
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO No.</label>
              <input required type="text" name="po_no" value={formData.po_no} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
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

          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              Cancel
            </button>
            {editingId && (
              <button type="button" onClick={handleDeleteClick} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center transition-colors font-medium text-sm">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            )}
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Delivery' : 'Save Delivery')}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-end p-2 border-b border-gray-50">
          <ColumnToggle columns={availableColumns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
        </div>

        {loading ? (
          <div className="p-8 flex justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Delivery ID</th>}
                      {visibleColumns.includes('po_no') && <th className="px-6 py-3 font-medium">PO No.</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('supplier') && <th className="px-6 py-3 font-medium">Supplier</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('received_by') && <th className="px-6 py-3 font-medium">Received By</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{d.delivery_id}</td>}
                        {visibleColumns.includes('po_no') && <td className="px-6 py-4 font-medium text-gray-600">{d.po_no}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(d.delivery_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('supplier') && <td className="px-6 py-4 text-gray-600">{d.suppliers?.supplier_name}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{d.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-blue-600">+{d.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">₱{Number(d.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
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

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {deliveries.map((d) => (
                <div key={d.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id_date') && (
                        <>
                          <p className="font-bold text-gray-900 text-lg">{d.delivery_id}</p>
                          <p className="text-xs text-gray-500">{d.delivery_date}</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => handleEdit(d)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    {visibleColumns.includes('material') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Material</p><p className="font-medium text-gray-800">{d.materials?.material_description}</p></div>
                    )}
                    {visibleColumns.includes('supplier') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Supplier</p><p className="font-medium text-gray-800">{d.suppliers?.supplier_name}</p></div>
                    )}
                    {visibleColumns.includes('qty') && (
                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-gray-800">{d.quantity_delivered}</p></div>
                    )}
                    {visibleColumns.includes('cost') && (
                      <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-medium text-gray-800">₱{Number(d.total_cost).toFixed(2)}</p></div>
                    )}
                    {visibleColumns.includes('po') && (
                      <div><p className="text-xs text-gray-500">PO Number</p><p className="font-medium text-gray-800">{d.purchase_order_number}</p></div>
                    )}
                    {visibleColumns.includes('po') && (
                      <div><p className="text-xs text-gray-500">Received By</p><p className="font-medium text-gray-800">{d.received_by}</p></div>
                    )}
                    {visibleColumns.includes('created_by') && (
                      <div><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{d.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{d.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>
              ))}
              {deliveries.length === 0 && (
                <div className="p-6 text-center text-gray-500">No deliveries recorded yet. Add at least 20 for your assignment.</div>
              )}
            </div>
          </>
        )}
      </div>
    
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={deliveries.find(m => m.id === editingId)?.delivery_id || 'this record'}
        isDeleting={isDeleting}
      />
    </div>
  );
}