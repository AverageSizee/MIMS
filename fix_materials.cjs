const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'pages', 'Materials.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// fix handleSubmit
content = content.replace(/min_reorder_level: parseInt\(formData\.min_reorder_level\)/, 'reorder_level: parseInt(formData.reorder_level)');
content = content.replace(/max_stock_level: parseInt\(formData\.max_stock_level\)/, 'target_level: parseInt(formData.target_level)');

// Also fix the form inputs if they were using the old names
content = content.replace(/name="min_reorder_level"/g, 'name="reorder_level"');
content = content.replace(/value=\{formData\.min_reorder_level\}/g, 'value={formData.reorder_level}');
content = content.replace(/name="max_stock_level"/g, 'name="target_level"');
content = content.replace(/value=\{formData\.max_stock_level\}/g, 'value={formData.target_level}');

// The generated ID logic is a bit crude ('MAT-' + Math.random), let's use the sequence logic like Deliveries
content = content.replace(/const generatedId = 'MAT-' \+ Math.floor\(10000 \+ Math.random\(\) \* 90000\);/g, `const { data: lastRecord } = await supabase.from('materials').select('material_id').order('material_id', { ascending: false }).limit(1);
        let generatedId = 'MAT-001';
        if (lastRecord && lastRecord.length > 0 && lastRecord[0].material_id) {
            const lastNum = parseInt(lastRecord[0].material_id.split('-')[1]);
            generatedId = \`MAT-\${(lastNum + 1).toString().padStart(3, '0')}\`;
        }`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Materials updated.');
