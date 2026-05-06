-- Estokitas — Schema PostgreSQL completo
-- Migrado do Supabase para PostgreSQL nativo

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (substitui auth.users do Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  reset_token   TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- CONTAS (dados da conta do usuário)
-- ============================================================
CREATE TABLE IF NOT EXISTS contas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- API KEYS (keysecret para integração externa)
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keysecret           TEXT NOT NULL UNIQUE,           -- valor em plain (hash para comparação)
  keysecret_encrypted TEXT,                            -- valor exibível (criptografado)
  is_active           BOOLEAN NOT NULL DEFAULT true,
  last_used_at        TIMESTAMPTZ,
  last_rotated_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_keysecret ON api_keys(keysecret) WHERE is_active = true;

-- ============================================================
-- PRODUTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id_produto    TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'hex'),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  preco         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  preco_compra  NUMERIC(12, 2),
  preco_venda   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  categoria     TEXT,
  imagem_url    TEXT,
  estoque       INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  variaveis     JSONB,
  descricoes    JSONB,
  imagens       JSONB,
  keysecret     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_user ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(user_id, ativo);

-- ============================================================
-- VENDAS / MOVIMENTAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_produto       TEXT NOT NULL,
  id_variavel      TEXT,
  nome_produto     TEXT NOT NULL,
  quantidade       INTEGER NOT NULL DEFAULT 1,
  preco_unitario   NUMERIC(12, 2) NOT NULL,
  total            NUMERIC(12, 2) NOT NULL,
  diminuir_estoque BOOLEAN NOT NULL DEFAULT true,
  aumentar_estoque BOOLEAN DEFAULT false,
  tipo             TEXT NOT NULL DEFAULT 'venda' CHECK (tipo IN ('venda', 'entrada')),
  descricao        TEXT,
  keysecret        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendas_user ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_produto ON vendas(id_produto);
CREATE INDEX IF NOT EXISTS idx_vendas_created ON vendas(user_id, created_at DESC);

-- ============================================================
-- AUDIT TRAIL
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_trail (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id  TEXT,
  action     TEXT NOT NULL,
  old_data   JSONB,
  new_data   JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECURITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS security_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type     TEXT NOT NULL,
  event_details  JSONB,
  ip_address     INET,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_produtos
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_vendas
  BEFORE UPDATE ON vendas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
