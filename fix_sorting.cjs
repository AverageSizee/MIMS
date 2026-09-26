const fs = require('fs');

const filesToPatch = [
    { name: 'Deliveries.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('delivery_id', { ascending: false })` },
    { name: 'Issuances.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('issuance_id', { ascending: false })` },
    { name: 'Returns.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('return_id', { ascending: false })` },
    { name: 'Materials.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('material_id', { ascending: false })` },
    { name: 'Suppliers.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('supplier_id', { ascending: false })` },
    { name: 'Employees.jsx', old: `.order('created_at', { ascending: false })`, new: `.order('full_name', { ascending: true })` }
];

filesToPatch.forEach(fileDef => {
    try {
        let c = fs.readFileSync(`src/pages/${fileDef.name}`, 'utf8');
        if (c.includes(fileDef.old)) {
            c = c.replace(new RegExp(fileDef.old.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), fileDef.new);
            fs.writeFileSync(`src/pages/${fileDef.name}`, c, 'utf8');
            console.log(`Patched ${fileDef.name}`);
        } else {
            console.log(`Could not find marker in ${fileDef.name}`);
        }
    } catch(e) {
        console.log(`Error patching ${fileDef.name}:`, e.message);
    }
});
