create extension if not exists vector;
create extension if not exists pg_trgm;

alter table "Product"
  add column if not exists "semanticEmbedding" vector(768),
  add column if not exists "semanticEmbeddingUpdatedAt" timestamp(3);

create index if not exists "Product_semanticEmbedding_hnsw_idx"
  on "Product" using hnsw ("semanticEmbedding" vector_cosine_ops)
  with (m = 16, ef_construction = 64)
  where "semanticEmbedding" is not null;

create index if not exists "Product_hybrid_text_trgm_idx"
  on "Product" using gin ((lower(coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))) gin_trgm_ops);
