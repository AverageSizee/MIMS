const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Suppliers.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Fix handleMaterialToggle
content = content.replace(
  "setFormData({ ...formData, materials_supplied: currentMats.join(', ') });",
  "setFormData({ ...formData, primary_materials_supplied: currentMats.join(', ') });"
);

// 2. Fix handleLocationSelected
content = content.replace(
  "setFormData(prev => ({ ...prev, address: data.display_name }));",
  "setFormData(prev => ({ ...prev, address_location: data.display_name }));"
);

// 3. Update LocationMarker and add MapUpdater
const oldMarker = `function LocationMarker({ onLocationSelected }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}`;

const newMarker = `import { useMap } from 'react-leaflet';
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
}`;
content = content.replace(oldMarker, newMarker);
content = content.replace("import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';", "import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';");

// 4. Lift state and add geocoding to handleEdit
const handleEditAnchor = `const handleEdit = (supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person || '',
      contact_info: supplier.contact_info || '',
      address_location: supplier.address_location || '',
      primary_materials_supplied: supplier.primary_materials_supplied || ''
    });
    setEditingId(supplier.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };`;

const handleEditReplacement = `
  const [mapPosition, setMapPosition] = useState(null);

  const geocodeAddress = async (address) => {
    if (!address) return;
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(address)}\`);
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
  };`;

content = content.replace(handleEditAnchor, handleEditReplacement);

// Fix "Locate" button in address field
const oldAddressUI = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
              <input required type="text" name="address_location" value={formData.address_location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
              
              {/* Map Picker */}`;

const newAddressUI = `<div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Address / Location</label>
                <button type="button" onClick={() => geocodeAddress(formData.address_location)} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
                   <MapPin className="w-3 h-3 mr-1"/> Find on Map
                </button>
              </div>
              <input required type="text" name="address_location" value={formData.address_location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
              
              {/* Map Picker */}`;
content = content.replace(oldAddressUI, newAddressUI);

// Pass props to LocationMarker and MapContainer
const oldMapContainer = `<LocationMarker onLocationSelected={handleLocationSelected} />`;
const newMapContainer = `<MapUpdater center={mapPosition} />
                  <LocationMarker onLocationSelected={handleLocationSelected} position={mapPosition} setPosition={setMapPosition} />`;
content = content.replace(oldMapContainer, newMapContainer);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Suppliers fixed.');
