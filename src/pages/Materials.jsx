import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2 , Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Materials() {
  const { user, isManager } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [affectedSuppliers, setAffectedSuppliers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Column management
  const availableColumns = [
    { id: 'id', label: 'Material ID' },
    { id: 'name', label: 'Material Description' },
    { id: 'category', label: 'Category' },
    { id: 'unit', label: 'Unit' },
    { id: 'cost', label: 'Unit Cost (₱)' },
    { id: 'levels', label: 'Reorder / Target' },
    { id: 'stock', label: 'Stock Balance' },
    { id: 'status', label: 'Status' }
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
    material_description: '', category: '', unit: '',
    unit_cost: '', reorder_level: '', target_level: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('inventory_dashboard').select('*').order('created_at', { ascending: false });
      
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
      material_description: material.material_description || '',
      category: material.category || '',
      unit: material.unit || '',
      unit_cost: material.unit_cost || '',
      reorder_level: material.reorder_level || '',
      target_level: material.target_level || ''
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
        material_description: formData.material_description,
        category: formData.category,
        unit: formData.unit,
        unit_cost: parseFloat(formData.unit_cost),
        reorder_level: parseInt(formData.reorder_level),
        target_level: parseInt(formData.target_level)
      };

      if (editingId) {
        const { error } = await supabase.from('materials').update({
          ...payload,
          updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('materials').select('material_id').order('material_id', { ascending: false }).limit(1);
          let generatedId = 'MAT-001';
          if (lastRecord && lastRecord.length > 0 && lastRecord[0].material_id) {
              const lastNum = parseInt(lastRecord[0].material_id.split('-')[1]);
              generatedId = `MAT-${(lastNum + 1).toString().padStart(3, '0')}`;
          }
          const { error } = await supabase.from('materials').insert([{
            ...payload,
            material_id: generatedId,
            created_by: user.id, updated_by: user.id }]);
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

  
  const handleDeleteClick = async () => {
    const mat = materials.find(m => m.id === editingId);
    if (!mat) return;
    try {
      const { data: allSuppliers } = await supabase.from('suppliers').select('id, supplier_name, primary_materials_supplied');
      if (allSuppliers) {
        const affected = allSuppliers.filter(s => s.primary_materials_supplied && s.primary_materials_supplied.split(', ').includes(mat.material_description));
        setAffectedSuppliers(affected);
      } else {
        setAffectedSuppliers([]);
      }
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error(error);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const mat = materials.find(m => m.id === editingId);
      if (mat) {
        for (const supp of affectedSuppliers) {
          const newMats = supp.primary_materials_supplied.split(', ').filter(m => m !== mat.material_description).join(', ');
          await supabase.from('suppliers').update({ primary_materials_supplied: newMats }).eq('id', supp.id);
        }
      }

      const { error } = await supabase.from('materials').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchMaterials();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  
  // Filtering & Pagination Logic
  const itemsPerPage = 20;
  
  const uniqueCategories = ['All', ...new Set(materials.map(m => m.category).filter(Boolean))];
  
  const filteredData = materials.filter(m => {
    const matchesSearch = Object.values(m).some(val => 
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSlicer = activeSlicer === 'All' || m.category === activeSlicer;
    return matchesSearch && matchesSlicer;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Master Materials List</h2>
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
          {showForm ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Description</label>
            <input required name="material_description" value={formData.material_description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
              <select required name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="" disabled>Select Unit...</option>
                <option value="Cu.m">Cu.m</option>
                <option value="Pieces">Pieces</option>
                <option value="Kgs.">Kgs.</option>
                <option value="Bag">Bag</option>
                <option value="Box.">Box.</option>
                <option value="Lot">Lot</option>
                <option value="m">m</option>
                <option value="Roll">Roll</option>
                <option value="Gallon">Gallon</option>
                <option value="Liter">Liter</option>
                <option value="Set">Set</option>
                <option value="Length">Length</option>
              </select>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
            <input required type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
              <input required type="number" name="reorder_level" value={formData.reorder_level} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>
              <input required type="number" name="target_level" value={formData.target_level} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
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
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Material' : 'Save Material')}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between p-2 border-b border-gray-50 items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
               <input type="text" placeholder="Search materials..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-md p-1.5 text-sm w-64" />
               <div className="flex gap-1 flex-wrap">
                  {uniqueCategories.map(cat => (
                     <button key={cat} onClick={() => {setActiveSlicer(cat); setCurrentPage(1);}} className={`px-3 py-1 text-xs rounded-full border ${activeSlicer === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>{cat}</button>
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
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Material ID</th>}
                      {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Material Description</th>}
                      {visibleColumns.includes('category') && <th className="px-6 py-3 font-medium">Category</th>}
                      {visibleColumns.includes('unit') && <th className="px-6 py-3 font-medium">Unit</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Unit Cost (₱)</th>}
                      {visibleColumns.includes('levels') && <th className="px-6 py-3 font-medium">Reorder / Target</th>}
                      {visibleColumns.includes('stock') && <th className="px-6 py-3 font-medium">Stock Balance</th>}
                      {visibleColumns.includes('status') && <th className="px-6 py-3 font-medium">Status</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{m.material_id}</td>}
                        {visibleColumns.includes('name') && <td className="px-6 py-4">{m.material_description}</td>}
                        {visibleColumns.includes('category') && <td className="px-6 py-4 text-gray-600">{m.category}</td>}
                        {visibleColumns.includes('unit') && <td className="px-6 py-4">{m.unit}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-medium">₱{Number(m.unit_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('levels') && <td className="px-6 py-4 text-gray-500">{m.reorder_level} / {m.target_level}</td>}
                        {visibleColumns.includes('stock') && <td className="px-6 py-4 font-bold text-gray-900">{m.stock_balance || 0}</td>}
                        {visibleColumns.includes('status') && <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 'NORMAL' ? 'bg-green-100 text-green-700' : m.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : m.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{m.status || 'NORMAL'}</span></td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No materials added yet. Add at least 20 for your assignment.</td></tr>
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
              {paginatedData.map((m) => (
                <div key={m.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id') && <p className="text-xs text-gray-500 font-medium">ID: {m.material_id}</p>}
                      {visibleColumns.includes('name') && <p className="font-bold text-gray-900 text-lg">{m.material_description}</p>}
                    </div>
                    <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    {visibleColumns.includes('category') && (
                      <div><p className="text-xs text-gray-500">Category</p><p className="font-medium text-gray-800">{m.category}</p></div>
                    )}
                    {visibleColumns.includes('uom') && (
                      <div><p className="text-xs text-gray-500">UoM</p><p className="font-medium text-gray-800">{m.unit}</p></div>
                    )}
                    {visibleColumns.includes('cost') && (
                        <div><p className="text-xs text-gray-500">Unit Cost</p><p className="font-medium text-gray-800">₱{Number(m.unit_cost).toFixed(2)}</p></div>
                      )}
                      {visibleColumns.includes('stock') && (
                        <div><p className="text-xs text-gray-500">Stock Balance</p><p className="font-bold text-gray-900">{m.stock_balance || 0}</p></div>
                      )}
                      {visibleColumns.includes('status') && (
                        <div><p className="text-xs text-gray-500">Status</p><span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 'NORMAL' ? 'bg-green-100 text-green-700' : m.status === 'REORDER' ? 'bg-amber-100 text-amber-700' : m.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{m.status || 'NORMAL'}</span></div>
                      )}
                    {visibleColumns.includes('levels') && (
                      <div><p className="text-xs text-gray-500">Min/Max</p><p className="font-medium text-gray-800">{m.reorder_level} / {m.target_level}</p></div>
                    )}
                    {visibleColumns.includes('created_by') && (
                      <div><p className="text-xs text-gray-500">Added By</p><p className="font-medium text-gray-600 italic">{m.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div><p className="text-xs text-gray-500">Updated By</p><p className="font-medium text-gray-600 italic">{m.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="p-6 text-center text-gray-500">No materials added yet. Add at least 20 for your assignment.</div>
              )}
            </div>
          </>
        )}
      </div>
    
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={materials.find(m => m.id === editingId)?.material_description || 'this material'}
        affectedItems={affectedSuppliers}
        isDeleting={isDeleting}
      />
    </div>
  );
}