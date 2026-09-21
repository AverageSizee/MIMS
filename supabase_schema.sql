-- ==========================================
-- SUPABASE SCHEMA FOR MIMS
-- Materials Inventory Management System
-- ==========================================

-- 1. Materials Table
CREATE TABLE public.materials (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    material_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_of_measurement VARCHAR(50),
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    min_reorder_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Suppliers Table
CREATE TABLE public.suppliers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    supplier_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_information VARCHAR(255),
    address TEXT,
    materials_supplied TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Deliveries Table
CREATE TABLE public.deliveries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    delivery_id VARCHAR(50) UNIQUE NOT NULL,
    delivery_date DATE NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    quantity_delivered INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_delivered * unit_cost) STORED,
    purchase_order_number VARCHAR(100),
    received_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Issuances Table
CREATE TABLE public.issuances (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    issuance_id VARCHAR(50) UNIQUE NOT NULL,
    issuance_date DATE NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    quantity_issued INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_issued * unit_cost) STORED,
    project_site VARCHAR(255),
    requested_by VARCHAR(255),
    released_by VARCHAR(255),
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Returns Table
CREATE TABLE public.returns (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    return_id VARCHAR(50) UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    quantity_returned INTEGER NOT NULL,
    condition VARCHAR(100),
    project_site VARCHAR(255),
    returned_by VARCHAR(255),
    received_by VARCHAR(255),
    reason TEXT,
    cost_of_returned_materials DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Inventory Dashboard View
CREATE OR REPLACE VIEW public.inventory_dashboard AS
SELECT 
    m.id,
    m.material_id,
    m.name,
    m.category,
    m.unit_of_measurement,
    m.min_reorder_level,
    m.max_stock_level,
    COALESCE(d.total_deliv, 0) AS total_delivered,
    COALESCE(i.total_iss, 0) AS total_issued,
    COALESCE(r.total_ret, 0) AS total_returned,
    (COALESCE(d.total_deliv, 0) - COALESCE(i.total_iss, 0) + COALESCE(r.total_ret, 0)) AS current_stock,
    CASE 
        WHEN (COALESCE(d.total_deliv, 0) - COALESCE(i.total_iss, 0) + COALESCE(r.total_ret, 0)) <= 0 THEN 'OUT OF STOCK'
        WHEN (COALESCE(d.total_deliv, 0) - COALESCE(i.total_iss, 0) + COALESCE(r.total_ret, 0)) <= m.min_reorder_level THEN 'REORDER'
        WHEN (COALESCE(d.total_deliv, 0) - COALESCE(i.total_iss, 0) + COALESCE(r.total_ret, 0)) > m.max_stock_level THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END AS status
FROM 
    public.materials m
LEFT JOIN (
    SELECT material_id, SUM(quantity_delivered) AS total_deliv 
    FROM public.deliveries GROUP BY material_id
) d ON m.id = d.material_id
LEFT JOIN (
    SELECT material_id, SUM(quantity_issued) AS total_iss 
    FROM public.issuances GROUP BY material_id
) i ON m.id = i.material_id
LEFT JOIN (
    SELECT material_id, SUM(quantity_returned) AS total_ret 
    FROM public.returns GROUP BY material_id
) r ON m.id = r.material_id;
