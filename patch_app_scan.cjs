const fs = require('fs');

let appCode = fs.readFileSync('src/App.jsx', 'utf8');

const importReplacement = `import Employees from './pages/Employees';
import ForcePasswordChange from './pages/ForcePasswordChange';
import React, { Suspense } from 'react';

const Scan = React.lazy(() => import('./pages/Scan'));`;
appCode = appCode.replace(`import Employees from './pages/Employees';\r\nimport ForcePasswordChange from './pages/ForcePasswordChange';`, importReplacement).replace(`import Employees from './pages/Employees';\nimport ForcePasswordChange from './pages/ForcePasswordChange';`, importReplacement);

const routeReplacement = `<Route path="returns" element={<Returns />} />
        <Route path="scan" element={<Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Camera...</div>}><Scan /></Suspense>} />`;
appCode = appCode.replace(`<Route path="returns" element={<Returns />} />`, routeReplacement);

fs.writeFileSync('src/App.jsx', appCode, 'utf8');
console.log('App.jsx updated with lazy loaded scan route');
