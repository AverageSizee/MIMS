const fs = require('fs');
['Issuances.jsx', 'Returns.jsx', 'Materials.jsx', 'Suppliers.jsx'].forEach(file => {
    let c = fs.readFileSync('src/pages/' + file, 'utf8');
    c = c.replace(/updater:profiles!updated_by\(full_name\)'\)'/g, "updater:profiles!updated_by(full_name)')");
    fs.writeFileSync('src/pages/' + file, c, 'utf8');
    console.log('Fixed quotes in', file);
});
