const fs = require('fs');
['Categories.jsx', 'Projects.jsx'].forEach(file => {
    try {
        let c = fs.readFileSync('src/pages/' + file, 'utf8');
        let pattern, replacer;
        if (file === 'Categories.jsx') {
            pattern = 'setCategories(data || []);';
            replacer = `let _data = data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          return timeB - timeA;
      });
      setCategories(_data);`;
            c = c.replace(/name:\s*formData\.name\.trim\(\)\r?\n\s*\}/g, 'name: formData.name.trim(),\n          updated_at: new Date().toISOString()\n        }');
        } else {
            pattern = 'setProjects(data || []);';
            replacer = `let _data = data || [];
      _data.sort((a, b) => {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at || 0).getTime();
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at || 0).getTime();
          return timeB - timeA;
      });
      setProjects(_data);`;
            c = c.replace(/name:\s*formData\.name\.trim\(\)\r?\n\s*\}/g, 'name: formData.name.trim(),\n          updated_at: new Date().toISOString()\n        }');
        }
        
        if (c.includes(pattern)) {
            c = c.replace(pattern, replacer);
            fs.writeFileSync('src/pages/' + file, c, 'utf8');
            console.log('Patched', file);
        } else {
            console.log('Pattern not found in', file);
        }
    } catch(e) {}
});
