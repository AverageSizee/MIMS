const fs = require('fs');

const patchJS = (file, stateSetter, sortLogic) => {
    try {
        let c = fs.readFileSync(`src/pages/${file}`, 'utf8');
        // Let's find the exact setter
        const oldSet = `set${stateSetter}(`;
        // Since the names differ, let's look for `setDeliveries(delRes.data || []);` etc.
        // Actually, we can just replace the assignment statement.
        let pattern, replacer;
        if (file === 'Deliveries.jsx') {
             pattern = `setDeliveries(delRes.data || []);`;
             replacer = `let _data = delRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.delivery_id?.localeCompare(a.delivery_id);
          return timeB - timeA;
      });
      setDeliveries(_data);`;
        } else if (file === 'Issuances.jsx') {
             pattern = `setIssuances(issRes.data || []);`;
             replacer = `let _data = issRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.issuance_id?.localeCompare(a.issuance_id);
          return timeB - timeA;
      });
      setIssuances(_data);`;
        } else if (file === 'Returns.jsx') {
             pattern = `setReturns(retRes.data || []);`;
             replacer = `let _data = retRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.return_id?.localeCompare(a.return_id);
          return timeB - timeA;
      });
      setReturns(_data);`;
        } else if (file === 'Materials.jsx') {
             pattern = `setMaterials(matRes.data || []);`;
             replacer = `let _data = matRes.data || [];
        _data.sort((a, b) => {
            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
            if (timeA === timeB) return b.material_id?.localeCompare(a.material_id);
            return timeB - timeA;
        });
        setMaterials(_data);`;
        } else if (file === 'Suppliers.jsx') {
             pattern = `setSuppliers(supRes.data || []);`;
             replacer = `let _data = supRes.data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          if (timeA === timeB) return b.supplier_id?.localeCompare(a.supplier_id);
          return timeB - timeA;
      });
      setSuppliers(_data);`;
        } else if (file === 'Employees.jsx') {
             pattern = `setEmployees(data || []);`;
             replacer = `let _data = data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          return timeB - timeA;
      });
      setEmployees(_data);`;
        }
        
        if (c.includes(pattern)) {
            c = c.replace(pattern, replacer);
            fs.writeFileSync(`src/pages/${file}`, c, 'utf8');
            console.log(`Patched array sorting in ${file}`);
        } else {
            console.log(`Pattern not found in ${file}`);
        }
    } catch(e) { console.log(e.message) }
}

patchJS('Deliveries.jsx');
patchJS('Issuances.jsx');
patchJS('Returns.jsx');
patchJS('Materials.jsx');
patchJS('Suppliers.jsx');
patchJS('Employees.jsx');
