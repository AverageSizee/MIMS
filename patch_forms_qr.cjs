const fs = require('fs');

function patchPage(filename) {
    let text = fs.readFileSync(`src/pages/${filename}`, 'utf8');

    // add import if not exists
    if (!text.includes('useSearchParams')) {
        text = text.replace(`import { useState, useEffect } from 'react';`, `import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'react-router-dom';`);
    }

    // add searchParams state
    if (!text.includes('const [searchParams, setSearchParams]')) {
        const hookSearch = `const { user, isManager } = useAuth();`;
        text = text.replace(hookSearch, hookSearch + `\n  const [searchParams, setSearchParams] = useSearchParams();`);
    }

    // add effect
    if (!text.includes('searchParams.get(\'material\')')) {
        const effectStr = `
  useEffect(() => {
    const matParam = searchParams.get('material');
    if (matParam && materials.length > 0) {
      const matched = materials.find(m => m.material_id === matParam);
      if (matched) {
         setFormData(prev => ({ ...prev, material_id: matched.id }));
         setShowForm(true);
         setSearchParams({});
      }
    }
  }, [searchParams, materials, setSearchParams]);
`;
        // insert after the main useEffect
        const mainEffect = `useEffect(() => {
    fetchData();
  }, []);`;
        const mainEffectCRLF = `useEffect(() => {\r\n    fetchData();\r\n  }, []);`;
        
        if (text.includes(mainEffect)) {
            text = text.replace(mainEffect, mainEffect + effectStr);
        } else if (text.includes(mainEffectCRLF)) {
            text = text.replace(mainEffectCRLF, mainEffectCRLF + effectStr);
        }
    }

    fs.writeFileSync(`src/pages/${filename}`, text, 'utf8');
    console.log(`${filename} patched`);
}

patchPage('Deliveries.jsx');
patchPage('Issuances.jsx');
patchPage('Returns.jsx');
