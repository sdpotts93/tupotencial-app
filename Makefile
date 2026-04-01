.PHONY: db-reset

# Reset local Supabase database, seed data, upload default assets, and set references
db-reset:
	npx supabase db reset
	./supabase/seed-storage.sh
