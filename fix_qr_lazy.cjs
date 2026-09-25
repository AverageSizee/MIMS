const fs = require('fs');
const path = require('path');

function fix(filename) {
  const filepath = path.join(__dirname, 'src', 'pages', filename);
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace static import with lazy
  content = content.replace(
    "import QRScanner from '../components/QRScanner';",
    "const QRScanner = React.lazy(() => import('../components/QRScanner'));"
  );

  // Add React and Suspense to the react import
  content = content.replace(
    "import { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, Suspense } from 'react';"
  );

  // Wrap QRScanner usage in Suspense
  content = content.replace(
    "<QRScanner\n      isOpen={showQRScanner}",
    "<Suspense fallback={null}><QRScanner\n      isOpen={showQRScanner}"
  );
  content = content.replace(
    "onScanned={handleQRScanned}\n    />",
    "onScanned={handleQRScanned}\n    /></Suspense>"
  );

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(filename + ' fixed with lazy load');
}

fix('Deliveries.jsx');
fix('Issuances.jsx');
