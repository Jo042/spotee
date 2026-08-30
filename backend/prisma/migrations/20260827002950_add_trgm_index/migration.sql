-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "spots_title_idx" ON "spots" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "spots_description_idx" ON "spots" USING GIN ("description" gin_trgm_ops);
