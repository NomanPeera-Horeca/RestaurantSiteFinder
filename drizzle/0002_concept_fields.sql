-- MySQL (Render MySQL, PlanetScale, etc.) — no backticks
ALTER TABLE leads ADD COLUMN serviceModel VARCHAR(64);
ALTER TABLE leads ADD COLUMN cuisineConcept VARCHAR(256);
ALTER TABLE leads ADD COLUMN priceTier VARCHAR(8);
ALTER TABLE leads ADD COLUMN conceptFitScore INT;
ALTER TABLE leads ADD COLUMN conceptRecommendation VARCHAR(16);
