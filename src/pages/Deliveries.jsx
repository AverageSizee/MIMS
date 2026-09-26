import React, { Suspense, lazy } from 'react';
const QRScannerModal = lazy(() => import('../components/QRScannerModal'));
import { useState, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Edit2, Trash2, ImageIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ColumnToggle from '../components/ColumnToggle';

export default function Deliveries() {
  const { user, profile, isManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [photoModalUrl, setPhotoModalUrl] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (resultText) => {
      setShowScanner(false);
      try {
          const data = JSON.parse(resultText);
          const mat = materials.find(m => m.material_description === data.m);
          setFormData(prev => ({
              ...prev,
              supplier_id: data.s || prev.supplier_id,
              material_id: mat ? mat.id : prev.material_id,
              received_by: profile?.full_name || prev.received_by
          }));
          setShowForm(true);
      } catch (e) {
          alert('Invalid QR Code format.');
      }
  };


  // Column management
  const availableColumns = [
    { id: 'id', label: 'Delivery ID' },
    { id: 'po_no', label: 'PO No.' },
    { id: 'date', label: 'Date' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'material', label: 'Material' },
    { id: 'quantity', label: 'Qty' },
    { id: 'cost', label: 'Total Cost' },
    { id: 'received_by', label: 'Received By' },
    { id: 'photo_url', label: 'Attachment' }
  ];
  if (isManager) {
    availableColumns.push({ id: 'created_by', label: 'Added By' });
    availableColumns.push({ id: 'updated_by', label: 'Updated By' });
  }

  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at', 'photo_url'].includes(id)));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  const initialFormState = {
    po_no: '',
    delivery_date: new Date().toISOString().split('T')[0],
    material_id: '',
    supplier_id: '',
    quantity: '',
    received_by: '',
    photo_url: '',
    files: []
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
      const [delRes, matRes, supRes] = await Promise.all([
        supabase.from('deliveries').select('*, materials(material_description), suppliers(supplier_name), creator:profiles!created_by(full_name), updater:profiles!updated_by(full_name)').order('delivery_id', { ascending: false }),
        supabase.from('materials').select('id, material_id, material_description, unit_cost'),
        supabase.from('suppliers').select('id, supplier_name')
      ]);
      
      let _data = delRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.delivery_id?.localeCompare(a.delivery_id);
          return timeB - timeA;
      });
      setDeliveries(_data);
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
      po_no: delivery.po_no || '',
      delivery_date: delivery.delivery_date || '',
      material_id: delivery.material_id || '',
      supplier_id: delivery.supplier_id || '',
      quantity: delivery.quantity || '',
      received_by: delivery.received_by || '',
      photo_url: delivery.photo_url || '',
      files: []
    });
    setEditingId(delivery.id);
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
      
      
      let finalUrls = formData.photo_url ? formData.photo_url.split(',').filter(Boolean) : [];
      if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `deliveries/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
          if (uploadError) {
              console.error('Upload error:', uploadError);
              alert('Upload failed: Please ensure the "attachments" bucket exists and is public.');
              throw uploadError;
          }
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          finalUrls.push(publicUrl);
        }
      }
      const payload = {
        po_no: formData.po_no,
        delivery_date: formData.delivery_date,
        material_id: formData.material_id,
        supplier_id: formData.supplier_id,
        quantity: quantity,
        unit_cost: unit_cost,
        total_cost: quantity * unit_cost,
        received_by: formData.received_by,
        photo_url: finalUrls.join(',')
      };

      if (editingId) {
        const { error } = await supabase.from('deliveries').update({
          ...payload,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: lastRecord } = await supabase.from('deliveries').select('delivery_id').order('delivery_id', { ascending: false }).limit(1);
        let newId = 'DEL-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].delivery_id) {
            const lastNum = parseInt(lastRecord[0].delivery_id.split('-')[1]);
            newId = `DEL-${(lastNum + 1).toString().padStart(3, '0')}`;
        }
        
        const { error } = await supabase.from('deliveries').insert([{
          ...payload,
          delivery_id: newId,
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

  
  // Filtering & Pagination Logic
  const itemsPerPage = 20;
  
  const filteredData = deliveries.filter(d => {
    return Object.values(d).some(val => 
      val && typeof val !== 'object' && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || (d.materials && d.materials.material_description && d.materials.material_description.toLowerCase().includes(searchTerm.toLowerCase()))
      || (d.suppliers && d.suppliers.supplier_name && d.suppliers.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Delivery Records (Inbound)</h2>
        
        <div className="flex items-center gap-2">
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
        <button onClick={() => setShowScanner(true)} title="Scan QR Code" className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>
        </button>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO No.</label>
              <input required type="text" name="po_no" value={formData.po_no} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
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
                  <option key={m.id} value={m.id}>{m.material_description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select required name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.supplier_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input required type="text" name="received_by" value={formData.received_by} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Attachments</label>
              <input type="file" multiple accept="image/*" onChange={(e) => {
                 if(e.target.files.length) {
                    setFormData(prev => ({ ...prev, files: [...(prev.files || []), ...Array.from(e.target.files)] }));
                 }
              }} className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white" />
              
              <div className="mt-3 space-y-2">
                {formData.photo_url && formData.photo_url.split(',').filter(Boolean).map((url, idx) => {
                   const fileName = url.split('/').pop();
                   return (
                     <div key={url} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-lg border border-blue-100">
                       <button type="button" onClick={() => setPhotoModalUrl(url)} className="text-blue-700 hover:underline flex items-center gap-2 truncate flex-1 text-left font-medium">
                         <ImageIcon className="w-4 h-4 shrink-0" /> <span className="truncate">{fileName}</span>
                       </button>
                       <button type="button" onClick={() => {
                          const newUrls = formData.photo_url.split(',').filter(Boolean).filter(u => u !== url).join(',');
                          setFormData(prev => ({ ...prev, photo_url: newUrls }));
                       }} className="text-red-500 p-1 hover:bg-red-100 rounded-md transition-colors" title="Remove attachment">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   );
                })}
                {formData.files && formData.files.length > 0 && formData.files.map((f, idx) => (
                     <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                       <ImageIcon className="w-4 h-4 shrink-0 text-gray-500" />
                       <span className="truncate flex-1 text-gray-700">{f.name}</span>
                       <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">Pending</span>
                       <button type="button" onClick={() => {
                          const newFiles = [...formData.files];
                          newFiles.splice(idx, 1);
                          setFormData(prev => ({ ...prev, files: newFiles }));
                       }} className="text-red-500 p-1 hover:bg-red-100 rounded-md transition-colors" title="Remove file">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
                Cancel
              </button>
              <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium text-sm transition-colors">
                {submitting ? 'Saving...' : (editingId ? 'Update Delivery' : 'Save Delivery')}
              </button>
            </div>
          </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between p-2 border-b border-gray-50 items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
               <input type="text" placeholder="Search deliveries..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-md p-1.5 text-sm w-64" />
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
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Delivery ID</th>}
                      {visibleColumns.includes('po_no') && <th className="px-6 py-3 font-medium">PO No.</th>}
                      {visibleColumns.includes('date') && <th className="px-6 py-3 font-medium">Date</th>}
                      {visibleColumns.includes('supplier') && <th className="px-6 py-3 font-medium">Supplier</th>}
                      {visibleColumns.includes('material') && <th className="px-6 py-3 font-medium">Material</th>}
                      {visibleColumns.includes('quantity') && <th className="px-6 py-3 font-medium">Qty</th>}
                      {visibleColumns.includes('cost') && <th className="px-6 py-3 font-medium">Total Cost</th>}
                      {visibleColumns.includes('received_by') && <th className="px-6 py-3 font-medium">Received By</th>}
                      {visibleColumns.includes('photo_url') && <th className="px-6 py-3 font-medium">Attachment</th>}
                      {visibleColumns.includes('created_by') && <th className="px-6 py-3 font-medium">Added By</th>}
                      {visibleColumns.includes('updated_by') && <th className="px-6 py-3 font-medium">Updated By</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRecord(d)}>
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{d.delivery_id}</td>}
                        {visibleColumns.includes('po_no') && <td className="px-6 py-4 font-medium text-gray-600">{d.po_no}</td>}
                        {visibleColumns.includes('date') && <td className="px-6 py-4">{new Date(d.delivery_date).toLocaleDateString()}</td>}
                        {visibleColumns.includes('supplier') && <td className="px-6 py-4 text-gray-600">{d.suppliers?.supplier_name}</td>}
                        {visibleColumns.includes('material') && <td className="px-6 py-4 font-medium text-gray-900">{d.materials?.material_description}</td>}
                        {visibleColumns.includes('quantity') && <td className="px-6 py-4 font-medium text-blue-600">+{d.quantity}</td>}
                        {visibleColumns.includes('cost') && <td className="px-6 py-4 font-bold text-gray-800">₱{Number(d.total_cost).toFixed(2)}</td>}
                        {visibleColumns.includes('received_by') && <td className="px-6 py-4 text-gray-500">{d.received_by}</td>}
                        {visibleColumns.includes('photo_url') && <td className="px-6 py-4">
                          {d.photo_url ? (
                            <span className="flex items-center text-blue-600">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>}
                        {visibleColumns.includes('created_by') && <td className="px-6 py-4 text-gray-500 italic">{d.creator?.full_name || 'System'}</td>}
                        {visibleColumns.includes('updated_by') && <td className="px-6 py-4 text-gray-500 italic">{d.updater?.full_name || '-'}</td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {deliveries.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No deliveries recorded yet. Add at least 20 for your assignment.</td></tr>
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
              {paginatedData.map((d) => (
                <div key={d.id} className="p-4 space-y-3 cursor-pointer" onClick={() => setSelectedRecord(d)}>
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id_date') && (
                        <>
                          <p className="font-bold text-gray-900 text-lg">{d.delivery_id}</p>
                          <p className="text-xs text-gray-500">{d.delivery_date}</p>
                        </>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
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
                    {visibleColumns.includes('photo_url') && (
                      <div className="col-span-2"><p className="text-xs text-gray-500">Attachment</p><div className="font-medium text-gray-800">
                          {d.photo_url ? (
                            <span className="flex items-center text-blue-600 mt-1">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{d.photo_url.split(',').filter(Boolean).length} File(s)</span>
                            </span>
                          ) : <span className="text-gray-400 text-sm">None</span>}
                      </div></div>
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
    
      <Suspense fallback={null}>
        {showScanner && <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScanned={handleScanResult} />}
      
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Delivery Details">
        {selectedRecord && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Delivery ID</p>
                <p className="font-medium text-gray-900">{selectedRecord.delivery_id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">PO No.</p>
                <p className="font-medium text-gray-900">{selectedRecord.po_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium text-gray-900">{selectedRecord.delivery_date}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Received By</p>
                <p className="font-medium text-gray-900">{selectedRecord.received_by}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Material</p>
                <p className="font-medium text-gray-900">{selectedRecord.materials?.material_description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Supplier</p>
                <p className="font-medium text-gray-900">{selectedRecord.suppliers?.supplier_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Quantity</p>
                <p className="font-medium text-gray-900">{selectedRecord.quantity}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Cost</p>
                <p className="font-medium text-gray-900">₱{selectedRecord.total_cost?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="col-span-2 border-t pt-4 mt-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photo Attachments</p>
                {selectedRecord.photo_url ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecord.photo_url.split(',').filter(Boolean).map((url, idx) => (
                      <button key={idx} onClick={(e) => { e.stopPropagation(); setPhotoModalUrl(url); }} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors justify-center font-medium truncate">
                        <ImageIcon className="w-4 h-4 shrink-0" /> <span className="truncate">View Photo {idx+1}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 text-gray-400 text-sm p-4 rounded-lg text-center border border-dashed border-gray-200">
                    No photos attached
                  </div>
                )}
              </div>
            
            <div className="flex gap-3 pt-4 border-t mt-6">
              <button onClick={() => setSelectedRecord(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Close
              </button>
              <button onClick={() => { handleEdit(selectedRecord); setSelectedRecord(null); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Record
              </button>
            </div>
          </div>
        )}
      </Modal>
</Suspense>

      <Modal isOpen={!!photoModalUrl} onClose={() => setPhotoModalUrl(null)} title="Photo Attachment">
        <div className="p-2 flex justify-center bg-gray-50 rounded-lg min-h-[200px] items-center">
          {photoModalUrl ? (
            <img src={photoModalUrl} alt="Attachment" className="max-w-full max-h-[70vh] rounded-lg shadow-sm animate-in zoom-in duration-300" />
          ) : (
            <p className="text-gray-500 text-sm">No photo available</p>
          )}
        </div>
        <button onClick={() => setPhotoModalUrl(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">Close</button>
      </Modal>
    </div>
  );
}