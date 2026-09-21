import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Returns() {
  const { user, isManager } = useAuth();
  const [returns, setReturns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id_date', label: 'ID / Date' },
    { id: 'material', label: 'Material' },
    { id: 'qty', label: 'Qty' },
    { id: 'condition', label: 'Condition' },
    { id: 'project_site', label: 'Project Site' },
    { id: 'personnel', label: 'Personnel' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id));

  const initialFormState = {
    return_date: new Date().toISOString().split('T')[0],
    material_id: '',
    quantity_returned: '',
    cost_of_returned_materials: '',
    condition: 'Good',
    project_site: '',
    returned_by: '',
    received_by: '',
    reason: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [retRes, matRes] = await Promise.all([
        supabase.from('returns').select('*, materials(name), creator:profiles!returns_created_by_fkey(full_name), updater:profiles!returns_updated_by_fkey(full_name)').order('created_at', { ascending: false }),
        supabase.from('materials').select('id, name, unit_cost')
      ]);
      
      setReturns(retRes.data || []);
      setMaterials(matRes.data || []);
    } catch (error) {
      console.error('Error fetching returns data:', error.message);
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
        cost_of_returned_materials: formData.quantity_returned && selectedMat 
          ? (parseInt(formData.quantity_returned) * selectedMat.unit_cost).toFixed(2)
          : ''
      });
    } else if (name === 'quantity_returned' && formData.material_id) {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      setFormData({ 
        ...formData, 
        [name]: value, 
        cost_of_returned_materials: value && selectedMat 
          ? (parseInt(value) * selectedMat.unit_cost).toFixed(2)
          : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEdit = (ret) => {
    setFormData({
      return_date: ret.return_date,
      material_id: ret.material_id || '',
      quantity_returned: ret.quantity_returned || '',
      cost_of_returned_materials: ret.cost_of_returned_materials || '',
      condition: ret.condition || 'Good',
      project_site: ret.project_site || '',
      returned_by: ret.returned_by || '',
      received_by: ret.received_by || '',
      reason: ret.reason || ''
    });
    setEditingId(ret.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        return_date: formData.return_date,
        material_id: formData.material_id,
        quantity_returned: parseInt(formData.quantity_returned),
        cost_of_returned_materials: parseFloat(formData.cost_of_returned_materials),
        condition: formData.condition,
        project_site: formData.project_site,
        returned_by: formData.returned_by,
        received_by: formData.received_by,
        reason: formData.reason
      };

      if (editingId) {
        const { error } = await supabase.from('returns').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'RET-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('returns').insert([{
          ...payload,
          return_id: generatedId,
          created_by: user.id
        }]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      console.error('Error saving return:', error.message);
      alert('Error saving return: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Return Records (Inbound)</h2>
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
          {showForm ? 'Cancel' : 'Record Return'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
            <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Return' : 'Record New Return'}</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required type="date" name="return_date" value={formData.return_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
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
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity_returned" value={formData.quantity_returned} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
              <input required type="number" step="0.01" name="cost_of_returned_materials" value={formData.cost_of_returned_materials} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select required name="condition" value={formData.condition} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
              <option value="Good">Good / Usable</option>
              <option value="Damaged">Damaged</option>
              <option value="Excess">Excess</option>
              <option value="Defective">Defective</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project/Site</label>
            <input required name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Returned By</label>
            <input required name="returned_by" value={formData.returned_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
            <input required name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
            <input required name="reason" value={formData.reason} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Return' : 'Save Return')}
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
                  {visibleColumns.includes('qty') && <th className="px-6 py-3 font-medium">Qty</th>}
                  {visibleColumns.includes('condition') && <th className="px-6 py-3 font-medium">Condition</th>}
                  {visibleColumns.includes('project_site') && <th className="px-6 py-3 font-medium">Project Site</th>}
                  {visibleColumns.includes('personnel') && <th className="px-6 py-3 font-medium">Personnel</th>}
                  {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                  {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    {visibleColumns.includes('id_date') && (
                      <td className="px-6 py-4">
                        <div className="font-medium">{r.return_id}</div>
                        <div className="text-xs text-gray-500">{r.return_date}</div>
                      </td>
                    )}
                    {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{r.materials?.name}</td>}
                    {visibleColumns.includes('qty') && <td className="px-6 py-4 font-medium text-green-600">+{r.quantity_returned}</td>}
                    {visibleColumns.includes('condition') && (
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          r.condition === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {r.condition}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('project_site') && (
                      <td className="px-6 py-4 text-gray-600">
                        <div>{r.project_site}</div>
                        <div className="text-xs truncate max-w-[150px]">{r.reason}</div>
                      </td>
                    )}
                    {visibleColumns.includes('personnel') && (
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        <div>Ret: {r.returned_by}</div>
                        <div>Rec: {r.received_by}</div>
                      </td>
                    )}
                    {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{r.creator?.full_name || 'System'}</td>}
                    {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{r.updater?.full_name || '-'}</td>}
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No returns recorded yet. Add at least 3 for your assignment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
