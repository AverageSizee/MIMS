import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Materials() {
  const { user, isManager } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id', label: 'Material ID' },
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'uom', label: 'UoM' },
    { id: 'cost', label: 'Unit Cost' },
    { id: 'levels', label: 'Min/Max Level' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id));

  const initialFormState = {
    name: '', category: '', unit_of_measurement: '',
    unit_cost: '', min_reorder_level: '', max_stock_level: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*, creator:profiles!materials_created_by_fkey(full_name), updater:profiles!materials_updated_by_fkey(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (material) => {
    setFormData({
      name: material.name,
      category: material.category || '',
      unit_of_measurement: material.unit_of_measurement || '',
      unit_cost: material.unit_cost || '',
      min_reorder_level: material.min_reorder_level || '',
      max_stock_level: material.max_stock_level || ''
    });
    setEditingId(material.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        unit_of_measurement: formData.unit_of_measurement,
        unit_cost: parseFloat(formData.unit_cost),
        min_reorder_level: parseInt(formData.min_reorder_level),
        max_stock_level: parseInt(formData.max_stock_level)
      };

      if (editingId) {
        const { error } = await supabase.from('materials').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'MAT-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('materials').insert([{
          ...payload,
          material_id: generatedId,
          created_by: user.id
        }]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error.message);
      alert('Error saving material: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Master Materials List</h2>
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
          {showForm ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
            <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Material' : 'Add New Material'}</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement (e.g. kgs, pcs)</label>
            <input required name="unit_of_measurement" value={formData.unit_of_measurement} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
            <input required type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
              <input required type="number" name="min_reorder_level" value={formData.min_reorder_level} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Level</label>
              <input required type="number" name="max_stock_level" value={formData.max_stock_level} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Material' : 'Save Material')}
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
                  {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Name</th>}
                  {visibleColumns.includes('category') && <th className="px-6 py-3 font-medium">Category</th>}
                  {visibleColumns.includes('uom') && <th className="px-6 py-3 font-medium">UoM</th>}
                  {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Unit Cost</th>}
                  {visibleColumns.includes('levels') && <th className="px-6 py-3 font-medium">Min/Max</th>}
                  {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                  {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{m.material_id}</td>}
                    {visibleColumns.includes('name') && <td className="px-6 py-4">{m.name}</td>}
                    {visibleColumns.includes('category') && <td className="px-6 py-4 text-gray-600">{m.category}</td>}
                    {visibleColumns.includes('uom') && <td className="px-6 py-4">{m.unit_of_measurement}</td>}
                    {visibleColumns.includes('cost') && <td className="px-6 py-4 font-medium">${Number(m.unit_cost).toFixed(2)}</td>}
                    {visibleColumns.includes('levels') && <td className="px-6 py-4 text-gray-500">{m.min_reorder_level} / {m.max_stock_level}</td>}
                    {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{m.creator?.full_name || 'System'}</td>}
                    {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{m.updater?.full_name || '-'}</td>}
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No materials added yet. Add at least 20 for your assignment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
