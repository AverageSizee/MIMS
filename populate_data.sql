-- ==========================================
-- CETS463: MADE4Learners DATA POPULATION SCRIPT
-- ==========================================

-- 1. CLEAR EXISTING DATA (To prevent duplicates)
DELETE FROM public.returns;
DELETE FROM public.issuances;
DELETE FROM public.deliveries;
DELETE FROM public.suppliers;
DELETE FROM public.materials;

-- 2. INSERT 5 ACCREDITED SUPPLIERS
INSERT INTO public.suppliers (supplier_id, name, contact_person, contact_information, address, materials_supplied) VALUES
('SUP-001', 'Prime Aggregate & Cement Corp.', 'Engr. Roberto Cruz', '0917-555-0101', 'Mandaue City Industrial Zone', 'Cement, Ready-Mix, Sand, Gravel'),
('SUP-002', 'Steel Asia Supply Co.', 'Ms. Elena Santos', '0918-555-0102', 'Cebu City Reclamation Area', 'Deformed Rebars, Tie Wire, Mesh'),
('SUP-003', 'Visayas Lumber & Formworks', 'Mr. Juan Reyes', '0920-555-0103', 'Talisay Highway Yard', 'Plywood, Phenolic, Coco Lumber'),
('SUP-004', 'Metro Hardware & Electrical', 'Ms. Ana Lim', '0922-555-0104', 'Downtown Cebu Commercial Hub', 'Nails, Wires, Conduits, Hardware'),
('SUP-005', 'BuildPro Plumbing & Masonry', 'Mr. Carlos Tan', '0919-555-0105', 'Lapu-Lapu City Industrial Site', 'CHB, PVC Pipes, PPR Pipes, Tiles');

-- 3. INSERT 20 CONSTRUCTION MATERIALS
INSERT INTO public.materials (material_id, name, category, unit_of_measurement, unit_cost, min_reorder_level, max_stock_level) VALUES
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

-- 4. INSERT DELIVERIES, ISSUANCES, AND RETURNS (Simplified logic based on screenshot data)
DO $$
DECLARE
    sup1 UUID := (SELECT id FROM suppliers WHERE supplier_id='SUP-001');
    sup2 UUID := (SELECT id FROM suppliers WHERE supplier_id='SUP-002');
    sup3 UUID := (SELECT id FROM suppliers WHERE supplier_id='SUP-003');
    sup4 UUID := (SELECT id FROM suppliers WHERE supplier_id='SUP-004');
    sup5 UUID := (SELECT id FROM suppliers WHERE supplier_id='SUP-005');
    
    mat1 UUID := (SELECT id FROM materials WHERE material_id='MAT-001');
    mat2 UUID := (SELECT id FROM materials WHERE material_id='MAT-002');
    mat3 UUID := (SELECT id FROM materials WHERE material_id='MAT-003');
    mat4 UUID := (SELECT id FROM materials WHERE material_id='MAT-004');
    mat5 UUID := (SELECT id FROM materials WHERE material_id='MAT-005');
    mat6 UUID := (SELECT id FROM materials WHERE material_id='MAT-006');
    mat7 UUID := (SELECT id FROM materials WHERE material_id='MAT-007');
    mat8 UUID := (SELECT id FROM materials WHERE material_id='MAT-008');
    mat9 UUID := (SELECT id FROM materials WHERE material_id='MAT-009');
    mat10 UUID := (SELECT id FROM materials WHERE material_id='MAT-010');
    mat11 UUID := (SELECT id FROM materials WHERE material_id='MAT-011');
    mat12 UUID := (SELECT id FROM materials WHERE material_id='MAT-012');
    mat13 UUID := (SELECT id FROM materials WHERE material_id='MAT-013');
    mat14 UUID := (SELECT id FROM materials WHERE material_id='MAT-014');
    mat15 UUID := (SELECT id FROM materials WHERE material_id='MAT-015');
    mat16 UUID := (SELECT id FROM materials WHERE material_id='MAT-016');
    mat17 UUID := (SELECT id FROM materials WHERE material_id='MAT-017');
    mat18 UUID := (SELECT id FROM materials WHERE material_id='MAT-018');
    mat19 UUID := (SELECT id FROM materials WHERE material_id='MAT-019');
    mat20 UUID := (SELECT id FROM materials WHERE material_id='MAT-020');
BEGIN

    -- 20 DELIVERIES
    INSERT INTO public.deliveries (delivery_id, delivery_date, supplier_id, material_id, quantity_delivered, unit_cost, purchase_order_number, received_by) VALUES
    ('DEL-001', '2026-09-01', sup1, mat1, 150, 240.00, 'PO-101', 'Engr. Dy'),
    ('DEL-002', '2026-09-01', sup1, mat3, 35, 950.00, 'PO-101', 'Engr. Dy'),
    ('DEL-003', '2026-09-02', sup2, mat5, 300, 165.00, 'PO-102', 'Engr. Dy'),
    ('DEL-004', '2026-09-02', sup2, mat8, 15, 1450.00, 'PO-102', 'Engr. Dy'),
    ('DEL-005', '2026-09-03', sup3, mat9, 50, 780.00, 'PO-103', 'Whse. Tech'),
    ('DEL-006', '2026-09-03', sup3, mat11, 800, 45.00, 'PO-103', 'Whse. Tech'),
    ('DEL-007', '2026-09-04', sup5, mat13, 2500, 13.00, 'PO-104', 'Engr. Dy'),
    ('DEL-008', '2026-09-04', sup5, mat14, 1000, 18.50, 'PO-104', 'Engr. Dy'),
    ('DEL-009', '2026-09-05', sup4, mat12, 20, 850.00, 'PO-105', 'Whse. Tech'),
    ('DEL-010', '2026-09-05', sup4, mat17, 10, 3200.00, 'PO-105', 'Whse. Tech'),
    ('DEL-011', '2026-09-06', sup1, mat2, 25, 3800.00, 'PO-106', 'Engr. Dy'),
    ('DEL-012', '2026-09-07', sup2, mat6, 450, 235.00, 'PO-107', 'Engr. Dy'),
    ('DEL-013', '2026-09-07', sup2, mat7, 150, 415.00, 'PO-107', 'Engr. Dy'),
    ('DEL-014', '2026-09-08', sup5, mat15, 30, 420.00, 'PO-108', 'Whse. Tech'),
    ('DEL-015', '2026-09-08', sup5, mat16, 70, 180.00, 'PO-108', 'Whse. Tech'),
    ('DEL-016', '2026-09-09', sup4, mat18, 5, 650.00, 'PO-109', 'Whse. Tech'),
    ('DEL-017', '2026-09-10', sup5, mat19, 50, 320.00, 'PO-110', 'Engr. Dy'),
    ('DEL-018', '2026-09-10', sup5, mat20, 15, 1850.00, 'PO-110', 'Engr. Dy'),
    ('DEL-019', '2026-09-11', sup1, mat1, 50, 240.00, 'PO-111', 'Whse. Tech'),
    ('DEL-020', '2026-09-12', sup3, mat10, 20, 1350.00, 'PO-112', 'Engr. Dy');

    -- 10 ISSUANCES
    INSERT INTO public.issuances (issuance_id, issuance_date, material_id, quantity_issued, unit_cost, project_site, requested_by, released_by, purpose) VALUES
    ('ISS-001', '2026-09-05', mat1, 40, 240.00, 'Bldg Maintenance', 'Site Supv.', 'Storekeeper', 'Ground Slab Pouring'),
    ('ISS-002', '2026-09-05', mat5, 100, 165.00, 'Bldg Maintenance', 'Site Supv.', 'Storekeeper', 'Footing Rebars'),
    ('ISS-003', '2026-09-06', mat9, 15, 780.00, 'Admin Renovation', 'Carpenter Lead', 'Storekeeper', 'Beam Formworks'),
    ('ISS-004', '2026-09-07', mat13, 800, 13.00, 'Facility Extension', 'Mason Lead', 'Storekeeper', 'Exterior Masonry'),
    ('ISS-005', '2026-09-08', mat8, 5, 1450.00, 'Bldg Maintenance', 'Steelman Lead', 'Storekeeper', 'Column Rebar Splicing'),
    ('ISS-006', '2026-09-08', mat2, 17, 3800.00, 'Bldg Maintenance', 'Site Supv.', 'Storekeeper', '2nd Floor Beam Pouring'),
    ('ISS-007', '2026-09-09', mat17, 2, 3200.00, 'Admin Renovation', 'Master Elect.', 'Storekeeper', 'Main Feeder Wiring'),
    ('ISS-008', '2026-09-09', mat7, 100, 415.00, 'Facility Extension', 'Site Supv.', 'Storekeeper', 'Girder Reinforcements'),
    ('ISS-009', '2026-09-10', mat14, 650, 18.50, 'Facility Extension', 'Mason Lead', 'Storekeeper', 'Perimeter Wall Laying'),
    ('ISS-010', '2026-09-11', mat10, 20, 1350.00, 'Admin Renovation', 'Carpenter Lead', 'Storekeeper', 'Slab Deck Shoring');

    -- 3 RETURNS
    INSERT INTO public.returns (return_id, return_date, material_id, quantity_returned, condition, project_site, returned_by, received_by, reason, cost_of_returned_materials) VALUES
    ('RET-001', '2026-09-10', mat1, 10, 'Good', 'Bldg Maintenance', 'Site Supv.', 'Storekeeper', 'Excess from pour', 2400.00),
    ('RET-002', '2026-09-11', mat9, 3, 'Good', 'Admin Renovation', 'Carpenter Lead', 'Storekeeper', 'Uncut full sheets', 2340.00),
    ('RET-003', '2026-09-12', mat13, 50, 'Good', 'Facility Extension', 'Mason Lead', 'Storekeeper', 'Over-estimated wall area', 650.00);

END $$;
