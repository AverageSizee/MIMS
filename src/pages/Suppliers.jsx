import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Suppliers() {
  const { user, isManager } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id', label: 'Supplier ID' },
    { id: 'name', label: 'Company' },
    { id: 'contact_person', label: 'Contact Person' },
    { id: 'contact_info', label: 'Contact Info' },
    { id: 'supplies', label: 'Supplies' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id));

  const initialFormState = {
    name: '', contact_person: '', contact_information: '', address: '', materials_supplied: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*, creator:profiles!suppliers_created_by_fkey(full_name), updater:profiles!suppliers_updated_by_fkey(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      contact_information: supplier.contact_information || '',
      address: supplier.address || '',
      materials_supplied: supplier.materials_supplied || ''
    });
    setEditingId(supplier.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        contact_person: formData.contact_person,
        contact_information: formData.contact_information,
        address: formData.address,
        materials_supplied: formData.materials_supplied
      };

      if (editingId) {
        const { error } = await supabase.from('suppliers').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'SUP-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('suppliers').insert([{ 
          ...payload, 
          supplier_id: generatedId,
          created_by: user.id
        }]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error.message);
      alert('Error saving supplier: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Suppliers Database</h2>
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
          {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
            <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input required name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info (Phone/Email)</label>
            <input required name="contact_information" value={formData.contact_information} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Materials Supplied</label>
            <input required name="materials_supplied" value={formData.materials_supplied} onChange={handleInputChange} placeholder="e.g. Cement, Steel, Lumber" className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea required name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" rows="2"></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Supplier' : 'Save Supplier')}
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
                  {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">ID</th>}
                  {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Company</th>}
                  {visibleColumns.includes('contact_person') && <th className="px-6 py-3 font-medium">Contact Person</th>}
                  {visibleColumns.includes('contact_info') && <th className="px-6 py-3 font-medium">Contact Info</th>}
                  {visibleColumns.includes('supplies') && <th className="px-6 py-3 font-medium">Supplies</th>}
                  {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                  {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{s.supplier_id}</td>}
                    {visibleColumns.includes('name') && <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>}
                    {visibleColumns.includes('contact_person') && <td className="px-6 py-4 text-gray-600">{s.contact_person}</td>}
                    {visibleColumns.includes('contact_info') && <td className="px-6 py-4 text-gray-600">{s.contact_information}</td>}
                    {visibleColumns.includes('supplies') && <td className="px-6 py-4">{s.materials_supplied}</td>}
                    {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{s.creator?.full_name || 'System'}</td>}
                    {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{s.updater?.full_name || '-'}</td>}
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No suppliers added yet. Add at least 5 for your assignment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
