-- Security migration — run after schema.sql
-- Adds refresh tokens, login lockout, and audit log

BEGIN;

-- ─── REFRESH TOKENS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,   -- SHA-256 of the actual token
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     DEFAULT FALSE,
    user_agent  TEXT,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rt_usuario  ON refresh_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rt_hash     ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_rt_expires  ON refresh_tokens(expires_at);

-- ─── LOGIN LOCKOUT COLUMNS ────────────────────────────────────────────────────
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS failed_attempts   INT          DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_login_at     TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_login_ip     INET;

-- ─── AUDIT LOG ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT,
    event       VARCHAR(50)  NOT NULL,   -- LOGIN_OK, LOGIN_FAIL, LOGOUT, REGISTER, PW_CHANGE
    ip_address  INET,
    user_agent  TEXT,
    detail      JSONB,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_event   ON audit_log(event);
CREATE INDEX IF NOT EXISTS idx_audit_ts      ON audit_log(created_at DESC);

-- Auto-clean refresh tokens older than 30 days (run via pg_cron or a daily job)
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '1 day';

COMMIT;
