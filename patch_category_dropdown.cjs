const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

const regex = /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Category<\/label>\s*<input required name="category" value=\{formData\.category\} onChange=\{handleInputChange\} className="w-full border border-gray-300 rounded-md p-2" \/>\s*<\/div>/g;

const newCategoryInput = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="" disabled>Select Category...</option>
                {categoriesList.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>`;

if (!regex.test(content)) {
  console.error("Regex did not match.");
} else {
  content = content.replace(regex, newCategoryInput);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Materials updated with Category Dropdown.');
}
