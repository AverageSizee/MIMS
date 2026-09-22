import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 , Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Issuances() {
  const { user, isManager } = useAuth();
  const [issuances, setIssuances] = useState([]);
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
    { id: 'cost', label: 'Total Cost' },
    { id: 'project_site', label: 'Project Site' },
    { id: 'personnel', label: 'Personnel' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id));

  const initialFormState = {
    issuance_date: new Date().toISOString().split('T')[0],
    material_id: '',
    quantity_issued: '',
    unit_cost: '',
    project_site: '',
    requested_by: '',
    released_by: '',
    purpose: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [issRes, matRes] = await Promise.all([
        supabase.from('issuances').select('*, materials(name), creator:profiles!issuances_created_by_fkey(full_name), updater:profiles!issuances_updated_by_fkey(full_name)').order('created_at', { ascending: false }),
        supabase.from('materials').select('id, name, unit_cost')
      ]);
      
      setIssuances(issRes.data || []);
      setMaterials(matRes.data || []);
    } catch (error) {
      console.error('Error fetching issuances data:', error.message);
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

  const handleEdit = (issuance) => {
    setFormData({
      issuance_date: issuance.issuance_date,
      material_id: issuance.material_id || '',
      quantity_issued: issuance.quantity_issued || '',
      unit_cost: issuance.unit_cost || '',
      project_site: issuance.project_site || '',
      requested_by: issuance.requested_by || '',
      released_by: issuance.released_by || '',
      purpose: issuance.purpose || ''
    });
    setEditingId(issuance.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        issuance_date: formData.issuance_date,
        material_id: formData.material_id,
        quantity_issued: parseInt(formData.quantity_issued),
        unit_cost: parseFloat(formData.unit_cost),
        project_site: formData.project_site,
        requested_by: formData.requested_by,
        released_by: formData.released_by,
        purpose: formData.purpose
      };

      if (editingId) {
        const { error } = await supabase.from('issuances').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const generatedId = 'ISS-' + Math.floor(10000 + Math.random() * 90000);
        const { error } = await supabase.from('issuances').insert([{
          ...payload,
          issuance_id: generatedId,
          created_by: user.id, updated_by: user.id }]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchData(); // refresh list
    } catch (error) {
      console.error('Error saving issuance:', error.message);
      alert('Error saving issuance: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('issuances').delete().eq('id', editingId);
      if (error) throw error;
      setShowForm(false);
      setEditingId(null);
      fetchIssuances();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    }
  };

  return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Issuance Records (Outbound)</h2>
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
          {showForm ? 'Cancel' : 'Issue Material'}
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required type="date" name="issuance_date" value={formData.issuance_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
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
              <input required type="number" name="quantity_issued" value={formData.quantity_issued} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
              <input required type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project/Site</label>
            <input required name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input required name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
            <input required name="requested_by" value={formData.requested_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Released By</label>
            <input required name="released_by" value={formData.released_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              Cancel
            </button>
            {editingId && (
              <button type="button" onClick={handleDelete} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center transition-colors font-medium text-sm">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            )}
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Issuance' : 'Save Issuance')}
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
                    {visibleColumns.includes('id_date') && <th className="px-6 py-3 font-medium">ID / Date</th>}
                    {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                    {visibleColumns.includes('qty') && <th className="px-6 py-3 font-medium">Qty</th>}
                    {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                    {visibleColumns.includes('project_site') && <th className="px-6 py-3 font-medium">Project Site</th>}
                    {visibleColumns.includes('personnel') && <th className="px-6 py-3 font-medium">Personnel</th>}
                    {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                    {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {issuances.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      {visibleColumns.includes('id_date') && (
                        <td className="px-6 py-4">
                          <div className="font-medium">{i.issuance_id}</div>
                          <div className="text-xs text-gray-500">{i.issuance_date}</div>
                        </td>
                      )}
                      {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{i.materials?.name}</td>}
                      {visibleColumns.includes('qty') && <td className="px-6 py-4 font-medium text-red-600">-{i.quantity_issued}</td>}
                      {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">${Number(i.total_cost).toFixed(2)}</td>}
                      {visibleColumns.includes('project_site') && (
                        <td className="px-6 py-4 text-gray-600">
                          <div>{i.project_site}</div>
                          <div className="text-xs truncate max-w-[150px]">{i.purpose}</div>
                        </td>
                      )}
                      {visibleColumns.includes('personnel') && (
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          <div>Req: {i.requested_by}</div>
                          <div>Rel: {i.released_by}</div>
                        </td>
                      )}
                      {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{i.creator?.full_name || 'System'}</td>}
                      {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{i.updater?.full_name || '-'}</td>}
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(i)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {issuances.length === 0 && (
                    <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No issuances recorded yet. Add at least 10 for your assignment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {issuances.map((i) => (
                <div key={i.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id_date') && (
                        <>
                          <p className="font-bold text-gray-900 text-lg">{i.issuance_id}</p>
                          <p className="text-xs text-gray-500">{i.issuance_date}</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => handleEdit(i)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    {visibleColumns.includes('material') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Material</p><p className="font-medium text-gray-800">{i.materials?.name}</p></div>
                    )}
                    {visibleColumns.includes('qty') && (
                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-red-600">-{i.quantity_issued}</p></div>
                    )}
                    {visibleColumns.includes('cost') && (
                      <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-medium text-gray-800">${Number(i.total_cost).toFixed(2)}</p></div>
                    )}
                    {visibleColumns.includes('project_site') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Project / Site (Purpose)</p><p className="font-medium text-gray-800">{i.project_site}</p><p className="text-xs text-gray-500">{i.purpose}</p></div>
                    )}
                    {visibleColumns.includes('personnel') && (
                      <div><p className="text-xs text-gray-500">Requested By</p><p className="font-medium text-gray-800">{i.requested_by}</p></div>
                    )}
                    {visibleColumns.includes('personnel') && (
                      <div><p className="text-xs text-gray-500">Released By</p><p className="font-medium text-gray-800">{i.released_by}</p></div>
                    )}
                    {visibleColumns.includes('created_by') && (
                      <div><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{i.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{i.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>
              ))}
              {issuances.length === 0 && (
                <div className="p-6 text-center text-gray-500">No issuances recorded yet. Add at least 10 for your assignment.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
