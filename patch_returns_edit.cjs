const fs = require('fs');
const path = require('path');

function replaceBetween(content, startString, endString, replacement) {
  const startIndex = content.indexOf(startString);
  if (startIndex === -1) {
    console.log("Could not find startString: " + startString.substring(0, 50));
    return content;
  }
  const endIndex = content.indexOf(endString, startIndex);
  if (endIndex === -1) {
    console.log("Could not find endString");
    return content;
  }
  return content.substring(0, startIndex) + replacement + content.substring(endIndex + endString.length);
}

let ret = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Returns.jsx'), 'utf8');

ret = replaceBetween(ret,
  "const handleEdit = (ret) => {",
  "setEditingId(ret.id);",
  `const handleEdit = (ret) => {
    setFormData({
      return_date: ret.return_date || '',
      project_site: ret.project_site || '',
      material_id: ret.material_id || '',
      quantity: ret.quantity || '',
      returned_by: ret.returned_by || '',
      received_by: ret.received_by || '',
      reason_condition: ret.reason_condition || ''
    });
    setEditingId(ret.id);`
);

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Returns.jsx'), ret, 'utf8');
console.log('Returns fixed.');
