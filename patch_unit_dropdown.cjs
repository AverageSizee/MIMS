const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

const regex = /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement \(e\.g\. kgs, pcs\)<\/label>\s*<input required name="unit" value=\{formData\.unit\} onChange=\{handleInputChange\} className="w-full border border-gray-300 rounded-md p-2" \/>\s*<\/div>/g;

const newUnitInput = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
              <select required name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="" disabled>Select Unit...</option>
                <option value="Cu.m">Cu.m</option>
                <option value="Pieces">Pieces</option>
                <option value="Kgs.">Kgs.</option>
                <option value="Bag">Bag</option>
                <option value="Box.">Box.</option>
                <option value="Lot">Lot</option>
                <option value="m">m</option>
                <option value="Roll">Roll</option>
                <option value="Gallon">Gallon</option>
                <option value="Liter">Liter</option>
                <option value="Set">Set</option>
                <option value="Length">Length</option>
              </select>
            </div>`;

if (!regex.test(content)) {
  console.error("Regex did not match.");
} else {
  content = content.replace(regex, newUnitInput);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Materials updated with Unit Dropdown.');
}
