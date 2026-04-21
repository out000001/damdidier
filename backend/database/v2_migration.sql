-- V2 migration: seguradoras + role
BEGIN;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

CREATE TABLE IF NOT EXISTS seguradoras (
  id               SERIAL PRIMARY KEY,
  tipo             VARCHAR(50) NOT NULL CHECK (tipo IN ('auto','vida','residencial','empresarial')),
  nome             VARCHAR(200) NOT NULL,
  descricao_curta  TEXT NOT NULL,
  descricao_completa TEXT,
  logo_url         TEXT,
  telefone         VARCHAR(30),
  site_url         TEXT,
  destaque         BOOLEAN NOT NULL DEFAULT FALSE,
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  ordem            INT     NOT NULL DEFAULT 0,
  criado_por       INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seg_tipo  ON seguradoras(tipo);
CREATE INDEX IF NOT EXISTS idx_seg_ativo ON seguradoras(ativo);
CREATE INDEX IF NOT EXISTS idx_seg_ordem ON seguradoras(tipo, ordem);

DROP TRIGGER IF EXISTS trg_seguradoras_updated_at ON seguradoras;
CREATE TRIGGER trg_seguradoras_updated_at
  BEFORE UPDATE ON seguradoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
