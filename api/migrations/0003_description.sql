-- Adds an optional description string to themes.
-- Apply with: npx wrangler d1 migrations apply <DB_NAME>
ALTER TABLE themes ADD COLUMN description TEXT;
