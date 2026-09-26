const fs = require('fs');

let c = fs.readFileSync('src/pages/Materials.jsx', 'utf8');
const matPattern = `setMaterials(mappedMaterials);`;
const matReplacer = `mappedMaterials.sort((a, b) => {
            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
            if (timeA === timeB) return b.material_id?.localeCompare(a.material_id);
            return timeB - timeA;
        });
        setMaterials(mappedMaterials);`;
c = c.replace(matPattern, matReplacer);
fs.writeFileSync('src/pages/Materials.jsx', c, 'utf8');

let s = fs.readFileSync('src/pages/Suppliers.jsx', 'utf8');
const supPattern = `setSuppliers(suppRes.data || []);`;
const supReplacer = `let _data = suppRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.supplier_id?.localeCompare(a.supplier_id);
          return timeB - timeA;
      });
      setSuppliers(_data);`;
s = s.replace(supPattern, supReplacer);
fs.writeFileSync('src/pages/Suppliers.jsx', s, 'utf8');
