-- DamDidier Seguros — PostgreSQL Schema
-- Run: psql $DATABASE_URL -f schema.sql

BEGIN;

-- Extension for UUIDs (optional — using SERIAL by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USUARIOS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id                SERIAL PRIMARY KEY,
    nome              VARCHAR(200) NOT NULL,
    cpf               CHAR(11)     NOT NULL UNIQUE,   -- digits only
    nascimento        DATE,
    sexo              VARCHAR(30),
    estado_civil      VARCHAR(30),
    email             VARCHAR(255) NOT NULL UNIQUE,
    telefone          VARCHAR(20),
    whatsapp          VARCHAR(20),
    profissao         VARCHAR(100),
    renda             VARCHAR(50),
    possui_seguro     BOOLEAN      DEFAULT FALSE,
    seguradora_atual  VARCHAR(100),
    receber_ofertas   BOOLEAN      DEFAULT FALSE,
    senha_hash        TEXT         NOT NULL,
    email_verificado  BOOLEAN      DEFAULT FALSE,
    reset_token       TEXT,
    reset_expiry      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf   ON usuarios(cpf);

-- ─── ENDERECOS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enderecos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cep         CHAR(8)      NOT NULL,
    rua         VARCHAR(255),
    numero      VARCHAR(20),
    complemento VARCHAR(100),
    bairro      VARCHAR(100),
    cidade      VARCHAR(100),
    estado      CHAR(2),
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enderecos_usuario ON enderecos(usuario_id);

-- ─── SEGUROS_INTERESSE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguros_interesse (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_seguro VARCHAR(50) NOT NULL CHECK (tipo_seguro IN ('auto','vida','residencial','empresarial')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (usuario_id, tipo_seguro)
);

CREATE INDEX IF NOT EXISTS idx_seguros_usuario ON seguros_interesse(usuario_id);

-- ─── AUTO-UPDATE updated_at ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
