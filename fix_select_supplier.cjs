const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Suppliers.jsx');
let content = fs.readFileSync(filepath, 'utf8');

const targetString = "setFormData({ ...formData, materials_supplied: values });";
const replacementString = "setFormData({ ...formData, primary_materials_supplied: values });";

if (content.includes(targetString)) {
  content = content.replace(targetString, replacementString);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed CreatableSelect onChange logic.');
} else {
  console.log('Target string not found.');
}
