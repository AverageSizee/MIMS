import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Loader2, Edit2, MapPin } from 'lucide-react';
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

function LocationMarker({ onLocationSelected }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
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
  const [editingId, setEditingId] = useState(null);
  const [locating, setLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', contact_person: '', contact_information: '', address: '', materials_supplied: ''
  });

  const availableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Company' },
    { id: 'contact_person', label: 'Contact Person' },
    { id: 'contact_info', label: 'Contact Info' },
    { id: 'supplies', label: 'Supplies' },
    { id: 'created_by', label: 'Added By' },
    { id: 'updated_by', label: 'Updated By' }
  ];
  
  const [visibleColumns, setVisibleColumns] = useState(['id', 'name', 'contact_person', 'contact_info', 'supplies']);

  async function fetchData() {
    try {
      const [suppRes, matRes] = await Promise.all([
        supabase.from('suppliers').select(`*, creator:created_by(full_name), updater:updated_by(full_name)`).order('created_at', { ascending: false }),
        supabase.from('materials').select('name').order('name')
      ]);
      if (suppRes.error) throw suppRes.error;
      if (matRes.error) throw matRes.error;
      
      setSuppliers(suppRes.data || []);
      setAvailableMaterials((matRes.data || []).map(m => m.name));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMaterialToggle = (matName) => {
    let currentMats = formData.materials_supplied ? formData.materials_supplied.split(', ').filter(Boolean) : [];
    if (currentMats.includes(matName)) {
      currentMats = currentMats.filter(m => m !== matName);
    } else {
      currentMats.push(matName);
    }
    setFormData({ ...formData, materials_supplied: currentMats.join(', ') });
  };

  const handleLocationSelected = async (lat, lng) => {
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
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
          ...formData, updated_by: user.id
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const countRes = await supabase.from('suppliers').select('id', { count: 'exact' });
        const newCount = (countRes.count || 0) + 1;
        const generatedId = `SUP-${String(newCount).padStart(3, '0')}`;
        
        const { error } = await supabase.from('suppliers').insert([{
          ...formData,
          supplier_id: generatedId,
          created_by: user.id, updated_by: user.id 
        }]);
        if (error) throw error;
      }
      
      setFormData({ name: '', contact_person: '', contact_information: '', address: '', materials_supplied: '' });
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert('Error saving supplier: ' + error.message);
    } finally {
      setSubmitting(false);
    }
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
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase">Supplier Directory</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({name:'', contact_person:'', contact_information:'', address:'', materials_supplied:''}); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-1" /> {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 border-b pb-2 mb-2">
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
            <CreatableSelect
              isMulti
              name="materials_supplied"
              options={availableMaterials.map(mat => ({ value: mat, label: mat }))}
              value={
                formData.materials_supplied
                  ? formData.materials_supplied.split(', ').filter(Boolean).map(mat => ({ value: mat, label: mat }))
                  : []
              }
              onChange={(selectedOptions) => {
                const values = selectedOptions ? selectedOptions.map(opt => opt.value).join(', ') : '';
                setFormData({ ...formData, materials_supplied: values });
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
            <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="Type address or click on the map below" className="w-full border border-gray-300 rounded-md p-2" rows="2"></textarea>
            
            {/* Map Picker */}
            <div className="h-48 w-full mt-2 rounded-md overflow-hidden border border-gray-300 relative z-0">
              <MapContainer center={[10.3157, 123.8854]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelected={handleLocationSelected} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 z-[400] bg-white/90 px-2 py-1 rounded shadow text-xs font-semibold text-gray-700 pointer-events-none flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-red-500" /> Click anywhere on map to auto-fill address
              </div>
            </div>
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
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    {visibleColumns.includes('id') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">ID</th>}
                    {visibleColumns.includes('name') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Company</th>}
                    {visibleColumns.includes('contact_person') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Contact Person</th>}
                    {visibleColumns.includes('contact_info') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Contact Info</th>}
                    {visibleColumns.includes('supplies') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Supplies</th>}
                    {visibleColumns.includes('created_by') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Added By</th>}
                    {visibleColumns.includes('updated_by') && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Updated By</th>}
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      {visibleColumns.includes('id') && <td className="px-6 py-4 font-medium">{s.supplier_id}</td>}
                      {visibleColumns.includes('name') && <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>}
                      {visibleColumns.includes('contact_person') && <td className="px-6 py-4 text-gray-600">{s.contact_person}</td>}
                      {visibleColumns.includes('contact_info') && <td className="px-6 py-4 text-gray-600">{s.contact_information}</td>}
                      {visibleColumns.includes('supplies') && <td className="px-6 py-4 text-xs">{s.materials_supplied}</td>}
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

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {suppliers.map((s) => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {visibleColumns.includes('id') && <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ID: {s.supplier_id}</p>}
                      {visibleColumns.includes('name') && <p className="font-bold text-gray-900 text-lg leading-tight mt-1">{s.name}</p>}
                    </div>
                    <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 bg-blue-50 rounded-lg shrink-0 ml-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                    {visibleColumns.includes('contact_person') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Contact Person</p><p className="font-medium text-gray-800">{s.contact_person}</p></div>
                    )}
                    {visibleColumns.includes('contact_info') && (
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Contact Info</p><p className="font-medium text-gray-800">{s.contact_information}</p></div>
                    )}
                    {visibleColumns.includes('supplies') && (
                      <div className="sm:col-span-2"><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Supplies</p><p className="font-medium text-gray-800 text-xs">{s.materials_supplied}</p></div>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
