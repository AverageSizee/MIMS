const fs = require('fs');
let c = fs.readFileSync('src/pages/Deliveries.jsx', 'utf8');
const searchStr = `'*, materials(material_description), suppliers(supplier_name)'`;
const replStr = `'*, materials(material_description), suppliers(supplier_name), creator:profiles!created_by(full_name), updater:profiles!updated_by(full_name)'`;
if (c.includes(searchStr)) {
    c = c.replace(searchStr, replStr);
    fs.writeFileSync('src/pages/Deliveries.jsx', c, 'utf8');
    console.log('Patched Deliveries query!');
} else {
    console.log('Could not find search string in Deliveries.jsx');
}
