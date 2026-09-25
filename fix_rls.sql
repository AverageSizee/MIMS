-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Create policies for materials
CREATE POLICY "Allow public all on materials" ON materials FOR ALL USING (true) WITH CHECK (true);

-- Create policies for suppliers
CREATE POLICY "Allow public all on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- Create policies for deliveries
CREATE POLICY "Allow public all on deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);

-- Create policies for issuances
CREATE POLICY "Allow public all on issuances" ON issuances FOR ALL USING (true) WITH CHECK (true);

-- Create policies for returns
CREATE POLICY "Allow public all on returns" ON returns FOR ALL USING (true) WITH CHECK (true);
