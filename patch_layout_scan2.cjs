const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.jsx', 'utf8');

const importOld = `import { LayoutDashboard, Package, Truck, ArrowRightLeft, Undo2, Users, LogOut, UserCircle, Menu, X } from 'lucide-react';`;
const importNew = `import { LayoutDashboard, Package, Truck, ArrowRightLeft, Undo2, Users, LogOut, UserCircle, Menu, X, ScanLine } from 'lucide-react';`;

const navLinkOld = `{ name: 'Dashboard', href: '/', icon: LayoutDashboard },\n    { name: 'Materials', href: '/materials', icon: Package },`;
const navLinkNew = `{ name: 'Dashboard', href: '/', icon: LayoutDashboard },\n    { name: 'Scan QR', href: '/scan', icon: ScanLine },\n    { name: 'Materials', href: '/materials', icon: Package },`;

content = content.replace(importOld, importNew);

if (content.includes(navLinkOld)) {
    content = content.replace(navLinkOld, navLinkNew);
} else if (content.includes(navLinkOld.replace(/\n/g, '\r\n'))) {
    content = content.replace(navLinkOld.replace(/\n/g, '\r\n'), navLinkNew.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/Layout.jsx', content, 'utf8');
console.log('Done!');
