const fs = require('fs');
const path = require('path');

const issFile = path.join(__dirname, 'src', 'pages', 'Issuances.jsx');
let iss = fs.readFileSync(issFile, 'utf8');
iss = iss.replace(/released_by:\s*''/, "released_by: 'Storekeeper'");
fs.writeFileSync(issFile, iss, 'utf8');

const retFile = path.join(__dirname, 'src', 'pages', 'Returns.jsx');
let ret = fs.readFileSync(retFile, 'utf8');
ret = ret.replace(/received_by:\s*''/, "received_by: 'Storekeeper'");
fs.writeFileSync(retFile, ret, 'utf8');

console.log("Form defaults set to Storekeeper");
