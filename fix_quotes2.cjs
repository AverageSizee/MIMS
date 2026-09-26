const fs = require('fs');
['Issuances.jsx', 'Returns.jsx', 'Materials.jsx', 'Suppliers.jsx'].forEach(file => {
    let c = fs.readFileSync('src/pages/' + file, 'utf8');
    c = c.replace(/\(full_name\)'\'\)/g, "(full_name)')");
    fs.writeFileSync('src/pages/' + file, c, 'utf8');
    console.log('Fixed quotes in', file);
});
