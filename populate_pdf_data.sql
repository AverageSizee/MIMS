-- SCRIPT TO POPULATE ALL 20 MATERIALS, 5 SUPPLIERS, AND ALL 33 TRANSACTIONS FROM THE PDF RUBRIC

-- 1. Insert 20 Materials
INSERT INTO materials (material_id, material_description, category, unit, unit_cost, reorder_level, target_level) VALUES
('MAT-001', 'Portland Cement (Type 1)', 'Cement & Aggregates', 'Bag', 240.00, 50, 200),
('MAT-002', 'Ready-Mix Concrete 3000 PSI', 'Cement & Aggregates', 'cu.m', 3800.00, 10, 50),
('MAT-003', 'Washed Sand', 'Cement & Aggregates', 'cu.m', 950.00, 15, 60),
('MAT-004', 'Crushed Gravel 3/4"', 'Cement & Aggregates', 'cu.m', 1100.00, 15, 60),
('MAT-005', 'Deformed Bar 10mm x 6m (Grade 33)', 'Reinforcement Steel', 'Length', 165.00, 100, 500),
('MAT-006', 'Deformed Bar 12mm x 6m (Grade 40)', 'Reinforcement Steel', 'Length', 235.00, 80, 400),
('MAT-007', 'Deformed Bar 16mm x 6m (Grade 40)', 'Reinforcement Steel', 'Length', 415.00, 60, 300),
('MAT-008', 'Tie Wire #16', 'Reinforcement Steel', 'Roll', 1450.00, 5, 20),
('MAT-009', 'Marine Plywood 1/2" x 4'' x 8''', 'Formwork & Lumber', 'Sheet', 780.00, 20, 100),
('MAT-010', 'Phenolic Board 3/4" x 4'' x 8''', 'Formwork & Lumber', 'Sheet', 1350.00, 15, 80),
('MAT-011', 'Coco Lumber 2" x 3" x 12''', 'Formwork & Lumber', 'bd.ft', 45.00, 200, 1000),
('MAT-012', 'Common Wire Nails 3"', 'Hardware', 'Box', 850.00, 4, 20),
('MAT-013', 'CHB 4" Non-Load Bearing', 'Masonry', 'Pcs', 13.00, 500, 2500),
('MAT-014', 'CHB 6" Load Bearing', 'Masonry', 'Pcs', 18.50, 400, 2000),
('MAT-015', 'PVC Pipe 4" S-1000 (Sanitary)', 'Plumbing', 'Length', 420.00, 10, 50),
('MAT-016', 'PPR Pipe 1/2" PN20 (Water)', 'Plumbing', 'Length', 180.00, 15, 60),
('MAT-017', 'THHN Wire 3.5mm2 (#12 AWG)', 'Electrical', 'Roll', 3200.00, 3, 15),
('MAT-018', 'Flexible Electrical Conduit 1/2"', 'Electrical', 'Roll', 650.00, 4, 20),
('MAT-019', 'Glazed Wall Tiles 30cm x 30cm', 'Finishes', 'Box', 320.00, 25, 100),
('MAT-020', 'Epoxy Floor Coating (Heavy Duty)', 'Finishes', 'Gal', 1850.00, 5, 25);

-- 2. Insert 5 Suppliers
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, contact_info, address_location, primary_materials_supplied) VALUES
('SUP-001', 'Prime Aggregate & Cement Corp.', 'Engr. Roberto Cruz', '0917-555-0101', 'Mandaue City Industrial Zone', 'Cement, Ready-Mix, Sand, Gravel'),
('SUP-002', 'Steel Asia Supply Co.', 'Ms. Elena Santos', '0918-555-0102', 'Cebu City Reclamation Area', 'Deformed Rebars, Tie Wire, Mesh'),
('SUP-003', 'Visayas Lumber & Formworks', 'Mr. Juan Reyes', '0920-555-0103', 'Talisay Highway Yard', 'Plywood, Phenolic, Coco Lumber'),
('SUP-004', 'Metro Hardware & Electrical', 'Ms. Ana Lim', '0922-555-0104', 'Downtown Cebu Commercial Hub', 'Nails, Wires, Conduits, Hardware'),
('SUP-005', 'BuildPro Plumbing & Masonry', 'Mr. Carlos Tan', '0919-555-0105', 'Lapu-Lapu City Industrial Site', 'CHB, PVC Pipes, PPR Pipes, Tiles');

-- 3. Insert 20 Deliveries
INSERT INTO deliveries (delivery_id, po_no, delivery_date, supplier_id, material_id, quantity, unit_cost, total_cost, received_by)
SELECT 'DEL-001', 'PO-101', '2026-09-01'::DATE, s.id, m.id, 150, 240.00, 36000.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-001' AND m.material_id = 'MAT-001'
UNION ALL SELECT 'DEL-002', 'PO-101', '2026-09-01'::DATE, s.id, m.id, 35, 950.00, 33250.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-001' AND m.material_id = 'MAT-003'
UNION ALL SELECT 'DEL-003', 'PO-102', '2026-09-02'::DATE, s.id, m.id, 300, 165.00, 49500.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-002' AND m.material_id = 'MAT-005'
UNION ALL SELECT 'DEL-004', 'PO-102', '2026-09-02'::DATE, s.id, m.id, 15, 1450.00, 21750.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-002' AND m.material_id = 'MAT-008'
UNION ALL SELECT 'DEL-005', 'PO-103', '2026-09-03'::DATE, s.id, m.id, 50, 780.00, 39000.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-003' AND m.material_id = 'MAT-009'
UNION ALL SELECT 'DEL-006', 'PO-103', '2026-09-03'::DATE, s.id, m.id, 800, 45.00, 36000.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-003' AND m.material_id = 'MAT-011'
UNION ALL SELECT 'DEL-007', 'PO-104', '2026-09-04'::DATE, s.id, m.id, 2500, 13.00, 32500.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-013'
UNION ALL SELECT 'DEL-008', 'PO-104', '2026-09-04'::DATE, s.id, m.id, 1000, 18.50, 18500.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-014'
UNION ALL SELECT 'DEL-009', 'PO-105', '2026-09-05'::DATE, s.id, m.id, 20, 850.00, 17000.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-004' AND m.material_id = 'MAT-012'
UNION ALL SELECT 'DEL-010', 'PO-105', '2026-09-05'::DATE, s.id, m.id, 10, 3200.00, 32000.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-004' AND m.material_id = 'MAT-017'
UNION ALL SELECT 'DEL-011', 'PO-106', '2026-09-06'::DATE, s.id, m.id, 25, 3800.00, 95000.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-001' AND m.material_id = 'MAT-002'
UNION ALL SELECT 'DEL-012', 'PO-107', '2026-09-07'::DATE, s.id, m.id, 450, 235.00, 105750.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-002' AND m.material_id = 'MAT-006'
UNION ALL SELECT 'DEL-013', 'PO-107', '2026-09-07'::DATE, s.id, m.id, 150, 415.00, 62250.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-002' AND m.material_id = 'MAT-007'
UNION ALL SELECT 'DEL-014', 'PO-108', '2026-09-08'::DATE, s.id, m.id, 30, 420.00, 12600.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-015'
UNION ALL SELECT 'DEL-015', 'PO-108', '2026-09-08'::DATE, s.id, m.id, 70, 180.00, 12600.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-016'
UNION ALL SELECT 'DEL-016', 'PO-109', '2026-09-09'::DATE, s.id, m.id, 5, 650.00, 3250.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-004' AND m.material_id = 'MAT-018'
UNION ALL SELECT 'DEL-017', 'PO-110', '2026-09-10'::DATE, s.id, m.id, 50, 320.00, 16000.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-019'
UNION ALL SELECT 'DEL-018', 'PO-110', '2026-09-10'::DATE, s.id, m.id, 15, 1850.00, 27750.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-005' AND m.material_id = 'MAT-020'
UNION ALL SELECT 'DEL-019', 'PO-111', '2026-09-11'::DATE, s.id, m.id, 50, 240.00, 12000.00, 'Whse. Tech' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-001' AND m.material_id = 'MAT-001'
UNION ALL SELECT 'DEL-020', 'PO-112', '2026-09-12'::DATE, s.id, m.id, 20, 1350.00, 27000.00, 'Engr. Dy' FROM suppliers s, materials m WHERE s.supplier_id = 'SUP-003' AND m.material_id = 'MAT-010';

-- 4. Insert 10 Issuances
INSERT INTO issuances (issuance_id, issuance_date, project_site, material_id, quantity, unit_cost, total_cost, requested_by, released_by, purpose)
SELECT 'ISS-001', '2026-09-05'::DATE, 'Bldg Maintenance', m.id, 40, 240.00, 9600.00, 'Site Supv.', 'Storekeeper', 'Ground Slab Pouring' FROM materials m WHERE m.material_id = 'MAT-001'
UNION ALL SELECT 'ISS-002', '2026-09-05'::DATE, 'Bldg Maintenance', m.id, 100, 165.00, 16500.00, 'Site Supv.', 'Storekeeper', 'Footing Rebars' FROM materials m WHERE m.material_id = 'MAT-005'
UNION ALL SELECT 'ISS-003', '2026-09-06'::DATE, 'Admin Renovation', m.id, 15, 780.00, 11700.00, 'Carpenter Lead', 'Storekeeper', 'Beam Formworks' FROM materials m WHERE m.material_id = 'MAT-009'
UNION ALL SELECT 'ISS-004', '2026-09-07'::DATE, 'Facility Extension', m.id, 800, 13.00, 10400.00, 'Mason Lead', 'Storekeeper', 'Exterior Masonry' FROM materials m WHERE m.material_id = 'MAT-013'
UNION ALL SELECT 'ISS-005', '2026-09-08'::DATE, 'Bldg Maintenance', m.id, 5, 1450.00, 7250.00, 'Steelman Lead', 'Storekeeper', 'Column Rebar Splicing' FROM materials m WHERE m.material_id = 'MAT-008'
UNION ALL SELECT 'ISS-006', '2026-09-08'::DATE, 'Bldg Maintenance', m.id, 17, 3800.00, 64600.00, 'Site Supv.', 'Storekeeper', '2nd Floor Beam Pouring' FROM materials m WHERE m.material_id = 'MAT-002'
UNION ALL SELECT 'ISS-007', '2026-09-09'::DATE, 'Admin Renovation', m.id, 2, 3200.00, 6400.00, 'Master Elect.', 'Storekeeper', 'Main Feeder Wiring' FROM materials m WHERE m.material_id = 'MAT-017'
UNION ALL SELECT 'ISS-008', '2026-09-09'::DATE, 'Facility Extension', m.id, 100, 415.00, 41500.00, 'Site Supv.', 'Storekeeper', 'Girder Reinforcements' FROM materials m WHERE m.material_id = 'MAT-007'
UNION ALL SELECT 'ISS-009', '2026-09-10'::DATE, 'Facility Extension', m.id, 650, 18.50, 12025.00, 'Mason Lead', 'Storekeeper', 'Perimeter Wall Laying' FROM materials m WHERE m.material_id = 'MAT-014'
UNION ALL SELECT 'ISS-010', '2026-09-11'::DATE, 'Admin Renovation', m.id, 20, 1350.00, 27000.00, 'Carpenter Lead', 'Storekeeper', 'Slab Deck Shoring' FROM materials m WHERE m.material_id = 'MAT-010';

-- 5. Insert 3 Returns
INSERT INTO returns (return_id, return_date, project_site, material_id, quantity, unit_cost, total_cost, returned_by, received_by, reason_condition)
SELECT 'RET-001', '2026-09-10'::DATE, 'Bldg Maintenance', m.id, 10, 240.00, 2400.00, 'Site Supv.', 'Storekeeper', 'Excess from pour / Good Condition' FROM materials m WHERE m.material_id = 'MAT-001'
UNION ALL SELECT 'RET-002', '2026-09-11'::DATE, 'Admin Renovation', m.id, 3, 780.00, 2340.00, 'Carpenter Lead', 'Storekeeper', 'Uncut full sheets / Good Condition' FROM materials m WHERE m.material_id = 'MAT-009'
UNION ALL SELECT 'RET-003', '2026-09-12'::DATE, 'Facility Extension', m.id, 50, 13.00, 650.00, 'Mason Lead', 'Storekeeper', 'Over-estimated wall area / Undamaged' FROM materials m WHERE m.material_id = 'MAT-013';
