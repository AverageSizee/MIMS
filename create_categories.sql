CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

INSERT INTO categories (name)
SELECT DISTINCT category FROM materials WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;
