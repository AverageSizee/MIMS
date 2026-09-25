const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Suppliers.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/name: '',/g, "supplier_name: '',");
c = c.replace(/contact_information: '',/g, "contact_info: '',");
c = c.replace(/address: '',/g, "address_location: '',");
c = c.replace(/materials_supplied: ''/g, "primary_materials_supplied: ''");

c = c.replace(/name: formData\.name/g, "supplier_name: formData.supplier_name");
c = c.replace(/contact_information: formData\.contact_information/g, "contact_info: formData.contact_info");
c = c.replace(/address: formData\.address/g, "address_location: formData.address_location");
c = c.replace(/materials_supplied: formData\.materials_supplied/g, "primary_materials_supplied: formData.primary_materials_supplied");

c = c.replace(/name: supplier\.name/g, "supplier_name: supplier.supplier_name");
c = c.replace(/contact_information: supplier\.contact_information/g, "contact_info: supplier.contact_info");
c = c.replace(/address: supplier\.address/g, "address_location: supplier.address_location");
c = c.replace(/materials_supplied: supplier\.materials_supplied/g, "primary_materials_supplied: supplier.primary_materials_supplied");

c = c.replace(/formData\.materials_supplied/g, "formData.primary_materials_supplied");
c = c.replace(/formData\.address/g, "formData.address_location");
c = c.replace(/s\.materials_supplied/g, "s.primary_materials_supplied");

c = c.replace(/s\.name/g, "s.supplier_name");
c = c.replace(/s\.contact_information/g, "s.contact_info");
c = c.replace(/s\.address/g, "s.address_location");

c = c.replace(/name="name"/g, 'name="supplier_name"');
c = c.replace(/value=\{formData\.name\}/g, "value={formData.supplier_name}");
c = c.replace(/name="contact_information"/g, 'name="contact_info"');
c = c.replace(/value=\{formData\.contact_information\}/g, "value={formData.contact_info}");
c = c.replace(/name="address"/g, 'name="address_location"');
c = c.replace(/value=\{formData\.address\}/g, "value={formData.address_location}");

c = c.replace(/<label[^>]*>Name<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>');
c = c.replace(/<label[^>]*>Contact Info[^<]*<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>');
c = c.replace(/<label[^>]*>Address<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>');
c = c.replace(/<label[^>]*>Materials Supplied<\/label>/, '<label className="block text-sm font-medium text-gray-700 mb-1">Primary Materials Supplied</label>');

c = c.replace(
  /const availableColumns = \[[\s\S]*?\];/,
  `const availableColumns = [
    { id: 'id', label: 'Supplier ID' },
    { id: 'name', label: 'Supplier Name' },
    { id: 'contact_person', label: 'Contact Person' },
    { id: 'contact_info', label: 'Contact Info' },
    { id: 'address', label: 'Address / Location' },
    { id: 'materials', label: 'Primary Materials Supplied' }
  ];`
);

fs.writeFileSync(file, c, 'utf8');
console.log('Suppliers.jsx mapped to new schema');
