import SupplierQRModal from '../components/SupplierQRModal';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Loader2, Edit2, MapPin , Trash2 } from 'lucide-react';
import ColumnToggle from '../components/ColumnToggle';
import CreatableSelect from 'react-select/creatable';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { useMap } from 'react-leaflet';
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationSelected, position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [extraWarnings, setExtraWarnings] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [qrSupplier, setQrSupplier] = useState(null);
  const [locating, setLocating] = useState(false);
  
  const initialFormState = { supplier_name: '', contact_person: '', contact_info: '', address_location: '', primary_materials_supplied: '' };
  const [formData, setFormData] = useState(initialFormState);

  const availableColumns = [
    { id: 'id', label: 'Supplier ID' },
    { id: 'name', label: 'Supplier Name' },
    { id: 'contact_person', label: 'Contact Person' },
    { id: 'contact_info', label: 'Contact Info' },
    { id: 'address', label: 'Address / Location' },
    { id: 'materials', label: 'Primary Materials Supplied' }
  ];
  
  const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(c => c.id).filter(id => !['created_by', 'updated_by', 'created_at'].includes(id)));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  async function fetchData() {
    try {
      const [suppRes, matRes] = await Promise.all([
        supabase.from('suppliers').select('*').order('supplier_id', { ascending: false }),
        supabase.from('materials').select('material_description').order('material_description')
      ]);
      if (suppRes.error) throw suppRes.error;
      if (matRes.error) throw matRes.error;
      
      let _data = suppRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.supplier_id?.localeCompare(a.supplier_id);
          return timeB - timeA;
      });
      setSuppliers(_data);
      setAvailableMaterials((matRes.data || []).map(m => m.material_description));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMaterialToggle = (matName) => {
    let currentMats = formData.primary_materials_supplied ? formData.primary_materials_supplied.split(', ').filter(Boolean) : [];
    if (currentMats.includes(matName)) {
      currentMats = currentMats.filter(m => m !== matName);
    } else {
      currentMats.push(matName);
    }
    setFormData({ ...formData, primary_materials_supplied: currentMats.join(', ') });
  };

  const handleLocationSelected = async (lat, lng) => {
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address_location: data.display_name }));
      }
    } catch (err) {
      console.error("Geocoding error", err);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('suppliers').update({
          ...formData, updated_by: user.id,
          updated_at: new Date().toISOString()
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        let nextNum = 1;
        const { data: latestSupplier } = await supabase.from('suppliers')
          .select('supplier_id')
          .order('supplier_id', { ascending: false })
          .limit(1);
          
        if (latestSupplier && latestSupplier.length > 0 && latestSupplier[0].supplier_id) {
          const match = latestSupplier[0].supplier_id.match(/SUP-(\d+)/);
          if (match) {
            nextNum = parseInt(match[1], 10) + 1;
          }
        }
        const generatedId = `SUP-${String(nextNum).padStart(3, '0')}`;
        
        const { error } = await supabase.from('suppliers').insert([{
          ...formData,
          supplier_id: generatedId,
          created_by: user.id, updated_by: user.id 
        }]);
        if (error) throw error;
      }
      
      setFormData(initialFormState);
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert('Error saving supplier: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  
  const [mapPosition, setMapPosition] = useState(null);

  const geocodeAddress = async (address) => {
    if (!address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error("Forward geocoding error", err);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person || '',
      contact_info: supplier.contact_info || '',
      address_location: supplier.address_location || '',
      primary_materials_supplied: supplier.primary_materials_supplied || ''
    });
    setEditingId(supplier.id);
    if (supplier.address_location) {
      geocodeAddress(supplier.address_location);
    }
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  
  const handleDeleteClick = async () => {
    try {
      let warnings = [];
      const { count: delCount } = await supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('supplier_id', editingId);
      if (delCount > 0) warnings.push(`Deliveries (${delCount} records)`);
      
      setExtraWarnings(warnings);
    } catch (err) {
      console.error(err);
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', editingId);
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      alert('Error deleting record: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  
  // Filtering & Pagination Logic
  const itemsPerPage = 20;
  
  const filteredData = suppliers.filter(s => {
    return Object.values(s).some(val => 
      val && typeof val !== 'object' && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (<div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase">Supplier Directory</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(initialFormState); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-1" /> {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} title={editingId ? 'Edit Record' : 'Add New Record'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input required name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input required name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <input required name="contact_info" value={formData.contact_info} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Materials Supplied</label>
            <CreatableSelect
              isMulti
              name="materials_supplied"
              options={availableMaterials.map(mat => ({ value: mat, label: mat }))}
              value={
                formData.primary_materials_supplied
                  ? formData.primary_materials_supplied.split(', ').filter(Boolean).map(mat => ({ value: mat, label: mat }))
                  : []
              }
              onChange={(selectedOptions) => {
                const values = selectedOptions ? selectedOptions.map(opt => opt.value).join(', ') : '';
                setFormData({ ...formData, primary_materials_supplied: values });
              }}
              placeholder="Search and select materials, or type to add new..."
              className="text-sm"
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  padding: '1px'
                })
              }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>Address</span>
              {locating && <span className="text-blue-500 text-xs flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Locating...</span>}
            </label>
            <textarea required name="address_location" value={formData.address_location} onChange={handleInputChange} placeholder="Type address or click on the map below" className="w-full border border-gray-300 rounded-md p-2" rows="2"></textarea>
            
            {/* Map Picker */}
            <div className="h-48 w-full mt-2 rounded-md overflow-hidden border border-gray-300 relative z-0">
              <MapContainer center={[10.3157, 123.8854]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapPosition} />
                  <LocationMarker onLocationSelected={handleLocationSelected} position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 z-[400] bg-white/90 px-2 py-1 rounded shadow text-xs font-semibold text-gray-700 pointer-events-none flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-red-500" /> Click anywhere on map to auto-fill address
              </div>
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
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Supplier' : 'Save Supplier')}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between p-2 border-b border-gray-50 items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
               <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-md p-1.5 text-sm w-64" />
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
                      {visibleColumns.includes('id') && <th className="px-6 py-3 font-medium">Supplier ID</th>}
                      {visibleColumns.includes('name') && <th className="px-6 py-3 font-medium">Supplier Name</th>}
                      {visibleColumns.includes('contact_person') && <th className="px-6 py-3 font-medium">Contact Person</th>}
                      {visibleColumns.includes('contact_info') && <th className="px-6 py-3 font-medium">Contact Info</th>}
                      {visibleColumns.includes('address') && <th className="px-6 py-3 font-medium">Address / Location</th>}
                      {visibleColumns.includes('materials') && <th className="px-6 py-3 font-medium">Primary Materials Supplied</th>}
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{s.supplier_id}</td>}
                        {visibleColumns.includes('name') && <td className="px-6 py-4 font-medium text-gray-900">{s.supplier_name}</td>}
                        {visibleColumns.includes('contact_person') && <td className="px-6 py-4">{s.contact_person}</td>}
                        {visibleColumns.includes('contact_info') && <td className="px-6 py-4 text-gray-600">{s.contact_info}</td>}
                        {visibleColumns.includes('address') && <td className="px-6 py-4 text-gray-500">{s.address_location}</td>}
                        {visibleColumns.includes('materials') && <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{s.primary_materials_supplied}</span></td>}
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button onClick={() => setQrSupplier(s)} title="View QR Codes" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && (
                      <tr><td colSpan={availableColumns.length + 1} className="px-6 py-8 text-center text-gray-500">No suppliers recorded yet. Add at least 5 for your assignment.</td></tr>
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
              {paginatedData.map((s) => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id') && <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ID: {s.supplier_id}</p>}
                      {visibleColumns.includes('name') && <p className="font-bold text-gray-900 text-lg leading-tight mt-1">{s.supplier_name}</p>}
                    </div>
                    <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 bg-blue-50 rounded-lg shrink-0 ml-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                      <button onClick={() => setQrSupplier(s)} className="p-2 text-purple-600 bg-purple-50 rounded-lg shrink-0 ml-2">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3m0 3h3m-3 0v-3m-3 3h.01"/></svg>
                      </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                    {visibleColumns.includes('contact_person') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Contact Person</p><p className="font-medium text-gray-800">{s.contact_person}</p></div>
                    )}
                    {visibleColumns.includes('contact_info') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Contact Info</p><p className="font-medium text-gray-800">{s.contact_info}</p></div>
                    )}
                    {visibleColumns.includes('supplies') && (
                      <div className="sm:col-span-2"><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Supplies</p><p className="font-medium text-gray-800 text-xs">{s.primary_materials_supplied}</p></div>
                    )}
                    {visibleColumns.includes('created_by') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Added By</p><p className="font-medium text-gray-600 italic">{s.creator?.full_name || 'System'}</p></div>
                    )}
                    {visibleColumns.includes('updated_by') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Updated By</p><p className="font-medium text-gray-600 italic">{s.updater?.full_name || '-'}</p></div>
                    )}
                  </div>
                </div>
              ))}
              {suppliers.length === 0 && (
                <div className="p-6 text-center text-gray-500">No suppliers added yet. Add at least 5 for your assignment.</div>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-50">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded border text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'}`}>{page}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 text-sm">Next</button>
                  </div>
              )}
            </div>
          </>
        )}
      </div>
    
      <ConfirmDeleteModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete}
        itemName={suppliers.find(m => m.id === editingId)?.supplier_name || 'this record'}
        extraWarnings={extraWarnings}
        isDeleting={isDeleting}
      />
    
      <SupplierQRModal isOpen={!!qrSupplier} onClose={() => setQrSupplier(null)} supplier={qrSupplier} />
    </div>
  );
}