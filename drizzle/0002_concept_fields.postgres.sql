-- PostgreSQL only (if DATABASE_URL starts with postgres://)
-- The app code expects MySQL; only use this if you have migrated the DB to Postgres.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "serviceModel" varchar(64);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "cuisineConcept" varchar(256);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "priceTier" varchar(8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "conceptFitScore" integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "conceptRecommendation" varchar(16);
