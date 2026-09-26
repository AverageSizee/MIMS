const fs = require('fs');

['Deliveries.jsx', 'Issuances.jsx', 'Returns.jsx'].forEach(file => {
    let content = fs.readFileSync('src/pages/' + file, 'utf8');
    content = content.replace(`select('id, material_description, unit_cost')`, `select('id, material_id, material_description, unit_cost')`);
    content = content.replace(`select('id, material_description')`, `select('id, material_id, material_description')`);
    fs.writeFileSync('src/pages/' + file, content, 'utf8');
    console.log(file, 'updated query');
});
