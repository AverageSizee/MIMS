const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.jsx', 'utf8');

const navLinkOld = `{ name: 'Dashboard', href: '/', icon: LayoutDashboard },\r
    { name: 'Materials', href: '/materials', icon: Package },`;
const navLinkNew = `{ name: 'Dashboard', href: '/', icon: LayoutDashboard },\r
    { name: 'Scan QR', href: '/scan', icon: ScanLine },\r
    { name: 'Materials', href: '/materials', icon: Package },`;

const importOld = `import { LayoutDashboard, Package, Users, Truck, ArrowRightLeft, LogOut, Menu, X, Undo2, UserCog } from 'lucide-react';`;
const importNew = `import { LayoutDashboard, Package, Users, Truck, ArrowRightLeft, LogOut, Menu, X, Undo2, UserCog, ScanLine } from 'lucide-react';`;

if (content.includes(importOld)) {
    content = content.replace(importOld, importNew);
    
    if (content.includes(navLinkOld.replace(/\r/g, ''))) {
        content = content.replace(navLinkOld.replace(/\r/g, ''), navLinkNew.replace(/\r/g, ''));
    } else if (content.includes(navLinkOld.replace(/\r/g, '\r\n'))) {
        content = content.replace(navLinkOld.replace(/\r/g, '\r\n'), navLinkNew.replace(/\r/g, '\r\n'));
    }
    
    fs.writeFileSync('src/components/Layout.jsx', content, 'utf8');
    console.log('Layout patched with Scan link');
} else {
    console.log('Imports not found');
}
