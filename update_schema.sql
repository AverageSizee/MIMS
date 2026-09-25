-- 1. Drop existing view and tables
DROP VIEW IF EXISTS inventory_dashboard CASCADE;
DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS issuances CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS materials CASCADE;

-- 2. Recreate Tables
-- Table: materials
CREATE TABLE materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id TEXT UNIQUE NOT NULL,
    material_description TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_cost NUMERIC NOT NULL,
    reorder_level NUMERIC NOT NULL,
    target_level NUMERIC NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: suppliers
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id TEXT UNIQUE NOT NULL,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    contact_info TEXT,
    address_location TEXT,
    primary_materials_supplied TEXT,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: deliveries
CREATE TABLE deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id TEXT UNIQUE NOT NULL,
    po_no TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    received_by TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: issuances
CREATE TABLE issuances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issuance_id TEXT UNIQUE NOT NULL,
    issuance_date DATE NOT NULL,
    project_site TEXT NOT NULL,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    requested_by TEXT NOT NULL,
    released_by TEXT NOT NULL,
    purpose TEXT,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: returns
CREATE TABLE returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    return_id TEXT UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    project_site TEXT NOT NULL,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    returned_by TEXT NOT NULL,
    received_by TEXT NOT NULL,
    reason_condition TEXT,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Recreate View: inventory_dashboard
CREATE VIEW inventory_dashboard AS
WITH delivery_totals AS (
    SELECT material_id, SUM(quantity) as qty FROM deliveries GROUP BY material_id
),
issuance_totals AS (
    SELECT material_id, SUM(quantity) as qty FROM issuances GROUP BY material_id
),
return_totals AS (
    SELECT material_id, SUM(quantity) as qty FROM returns GROUP BY material_id
)
SELECT 
    m.id,
    m.material_id,
    m.material_description,
    m.category,
    m.unit,
    m.unit_cost,
    m.reorder_level,
    m.target_level,
    m.created_at,
    m.created_by,
    m.updated_by,
    COALESCE(d.qty, 0) AS total_delivered,
    COALESCE(i.qty, 0) AS total_issued,
    COALESCE(r.qty, 0) AS total_returned,
    (COALESCE(d.qty, 0) - COALESCE(i.qty, 0) + COALESCE(r.qty, 0)) AS stock_balance,
    CASE
        WHEN (COALESCE(d.qty, 0) - COALESCE(i.qty, 0) + COALESCE(r.qty, 0)) = 0 THEN 'OUT OF STOCK'
        WHEN (COALESCE(d.qty, 0) - COALESCE(i.qty, 0) + COALESCE(r.qty, 0)) <= m.reorder_level THEN 'REORDER'
        WHEN (COALESCE(d.qty, 0) - COALESCE(i.qty, 0) + COALESCE(r.qty, 0)) > m.target_level THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END AS status
FROM materials m
LEFT JOIN delivery_totals d ON m.id = d.material_id
LEFT JOIN issuance_totals i ON m.id = i.material_id
LEFT JOIN return_totals r ON m.id = r.material_id;
