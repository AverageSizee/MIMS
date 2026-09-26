import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 , Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Returns() {
  const { user, isManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id', label: 'Return ID' },
    { id: 'date', label: 'Date' },
    { id: 'site', label: 'Project / Site' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'returned', label: 'Returned By' },
    { id: 'received', label: 'Received By' },
    { id: 'reason_condition', label: 'Reason & Condition' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at'].includes(id)));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlicer, setActiveSlicer] = useState('All');


  const initialFormState = {
    return_date: new Date().toISOString().split('T')[0],
    project_site: '',
    material_id: '',
    quantity: '',
    returned_by: '',
    received_by: 'Storekeeper',
    reason_condition: ''
  };
  const [formData, setFormData] = useState(initialFormState);


  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const matParam = searchParams.get('material');
    if (matParam && materials.length > 0) {
      const matched = materials.find(m => m.material_id === matParam);
      if (matched) {
         setFormData(prev => ({ ...prev, material_id: matched.id }));
         setShowForm(true);
         setSearchParams({});
      }
    }
  }, [searchParams, materials, setSearchParams]);


  async function fetchData() {
    setLoading(true);
    try {
      const [retRes, matRes] = await Promise.all([
        supabase.from('returns').select('*, materials(material_description)').order('created_at', { ascending: false }),
        supabase.from('materials').select('id, material_id, material_description, unit_cost')
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
      return_date: ret.return_date || '',
      project_site: ret.project_site || '',
      material_id: ret.material_id || '',
      quantity: ret.quantity || '',
      returned_by: ret.returned_by || '',
      received_by: ret.received_by || '',
      reason_condition: ret.reason_condition || ''
    });
    setEditingId(ret.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === formData.material_id);
      const unit_cost = selectedMat ? Number(selectedMat.unit_cost) : 0;
      const quantity = parseInt(formData.quantity) || 0;
      
      const payload = {
        return_date: formData.return_date,
        project_site: formData.project_site,
        material_id: formData.material_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        returned_by: formData.returned_by,
        received_by: formData.received_by,
        reason_condition: formData.reason_condition
      };

      if (editingId) {
        const { error } = await supabase.from('returns').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('returns').select('return_id').order('return_id', { ascending: false }).limit(1);
        let newId = 'RET-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].return_id) {
            const lastNum = parseInt(lastRecord[0].return_id.split('-')[1]);
            newId = `RET-${(lastNum + 1).toString().padStart(3, '0')}`;
        }
        
        const { error } = await supabase.from('returns').insert([{
          ...payload,
          return_id: newId,
          created_by: user.id, updated_by: user.id }]);
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

  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('returns').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchReturns();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  
  // Filtering & Pagination Logic
  const itemsPerPage = 20;
  
  const uniqueSites = ['All', ...new Set(returns.map(r => r.project_site).filter(Boolean))];
  
  const filteredData = returns.filter(r => {
    const matchesSearch = Object.values(r).some(val => 
      val && typeof val !== 'object' && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || (r.materials && r.materials.material_description && r.materials.material_description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSlicer = activeSlicer === 'All' || r.project_site === activeSlicer;
    return matchesSearch && matchesSlicer;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Return Records (Inbound)</h2>
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
          {showForm ? 'Cancel' : 'Record Return'}
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" name="return_date" value={formData.return_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project / Site</label>
              <input required type="text" name="project_site" value={formData.project_site} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select required name="material_id" value={formData.material_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason & Condition</label>
              <input required type="text" name="reason_condition" value={formData.reason_condition} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returned By</label>
              <input required type="text" name="returned_by" value={formData.returned_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
                Cancel
              </button>
              <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
                {submitting ? 'Saving...' : (editingId ? 'Update Return' : 'Save Return')}
              </button>
            </div>
          </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between p-2 border-b border-gray-50 items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
               <input type="text" placeholder="Search returns..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-md p-1.5 text-sm w-64" />
               <div className="flex gap-1 flex-wrap">
                  {uniqueSites.map(site => (
                     <button key={site} onClick={() => {setActiveSlicer(site); setCurrentPage(1);}} className={`px-3 py-1 text-xs rounded-full border ${activeSlicer === site ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>{site}</button>
                  ))}
               </div>
            </div>
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
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Return ID</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('site') && <th className="px-6 py-3 font-medium">Project / Site</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('returned') && <th className="px-6 py-3 font-medium">Returned By</th>}
                      {visibleColumns.includes('received') && <th className="px-6 py-3 font-medium">Received By</th>}
                      {visibleColumns.includes('reason_condition') && <th className="px-6 py-3 font-medium">Reason & Condition</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{r.return_id}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(r.return_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('site') && <td className="px-6 py-4">{r.project_site}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{r.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-green-600">+{r.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">₱{Number(r.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('returned') && <td className="px-6 py-4 text-gray-500">{r.returned_by}</td>}
                        {visibleColumns.includes('received') && <td className="px-6 py-4 text-gray-500">{r.received_by}</td>}
                        {visibleColumns.includes('reason_condition') && <td className="px-6 py-4 text-gray-500">{r.reason_condition}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {returns.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No returns recorded yet. Add at least 3 for your assignment.</td></tr>
                    )}
                  </tbody>
                    {totalPages > 1 && (
                      <tfoot>
                        <tr>
                          <td colSpan="100%">
                            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-50">
                              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Prev</button>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded border text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'}`}>{page}</button>
                              ))}
                              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Next</button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {paginatedData.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id_date') && (
                        <>
                          <p className="font-bold text-gray-900 text-lg">{r.return_id}</p>
                          <p className="text-xs text-gray-500">{r.return_date}</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => handleEdit(r)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    {visibleColumns.includes('material') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Material</p><p className="font-medium text-gray-800">{r.materials?.material_description}</p></div>
                    )}
                    {visibleColumns.includes('qty') && (
                      <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-green-600">+{r.quantity}</p></div>
                    )}
                    {visibleColumns.includes('condition') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Condition</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          r.condition === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {r.condition}
                        </span>
                      </div>
                    )}
                    {visibleColumns.includes('project_site') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Project / Site (Reason)</p><p className="font-medium text-gray-800">{r.project_site}</p><p className="text-xs text-gray-500">{r.reason}</p></div>
                    )}
                    {visibleColumns.includes('personnel') && (
                      <div><p className="text-xs text-gray-500">Returned By</p><p className="font-medium text-gray-800">{r.returned_by}</p></div>
                    )}
                    {visibleColumns.includes('personnel') && (
                      <div><p className="text-xs text-gray-500">Received By</p><p className="font-medium text-gray-800">{r.received_by}</p></div>
                    )}
                    {visibleColumns.includes('created_by') && (
                      <div><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{r.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{r.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>
              ))}
              {returns.length === 0 && (
                <div className="p-6 text-center text-gray-500">No returns recorded yet. Add at least 3 for your assignment.</div>
              )}
            </div>
          </>
        )}
      </div>
    
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={returns.find(m => m.id === editingId)?.return_id || 'this record'}
        isDeleting={isDeleting}
      />
    </div>
  );
}