-- SUPABASE SETUP - Painel de Manutenção (GPS) 
-- Este script é IDEMPOTENTE: você pode rodar e colar ele inteiro quantas vezes quiser!

-- 1. Tabelas de Unidades
CREATE TABLE IF NOT EXISTS unidades (
    sigla TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    regional TEXT,
    analista TEXT,
    supervisor TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Catálogo Global de Equipamentos (O "DNA" das máquinas)
CREATE TABLE IF NOT EXISTS modelos_equipamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_chave TEXT UNIQUE NOT NULL, -- Ex: EST-PADRAO-01
    tipo TEXT CHECK (tipo IN ('esteira', 'painel')),
    marca TEXT,
    manual_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Peças Técnicas de cada Modelo (Biblioteca Global)
CREATE TABLE IF NOT EXISTS pecas_modelo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_id UUID REFERENCES modelos_equipamento(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    codigo_item TEXT,
    referencia TEXT,
    tamanho TEXT,
    medida TEXT, -- Medida da Peça (opcional)
    tipo TEXT, -- Categoria (Mecânico, Elétrico, etc)
    descricao TEXT, -- Novo: Descrição técnica/instruções
    is_critico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Ativos Instalados nas Unidades (Atribuição de Modelos às Unidades)
CREATE TABLE IF NOT EXISTS ativos_unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    tag TEXT NOT NULL, -- Ex: EST-01, PNL-B
    modelo_id UUID REFERENCES modelos_equipamento(id),
    qtd_modulos INTEGER, -- Apenas para Esteiras
    comprimento_modulo DECIMAL,
    lista_comprimentos JSONB, -- [2.0, 2.5, 1.8]
    info_adicional TEXT,
    localizacao TEXT, -- Apenas para Painéis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Controle de Estoque (Real vs Obrigatório)
CREATE TABLE IF NOT EXISTS estoque_unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    componente TEXT NOT NULL,
    codigo_item TEXT,
    estoque_real INTEGER DEFAULT 0,
    estoque_obrigatorio INTEGER DEFAULT 0,
    observacao TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Registro de Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cargo TEXT, -- Novo
    cpf TEXT,
    telefone TEXT,
    escala TEXT, -- Novo
    horario TEXT, -- Novo
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Histórico de Pendências (Gaiolas)
CREATE TABLE IF NOT EXISTS historico_gaiolas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    tecnico_nome TEXT,
    quantidade INTEGER DEFAULT 0,
    carimbo_data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Links Úteis
CREATE TABLE IF NOT EXISTS links_uteis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    texto TEXT,
    url TEXT NOT NULL
);

-- 🔄 BLOCO DE ATUALIZAÇÃO (Idempotente: Adiciona colunas se não existirem)
DO $$ 
BEGIN 
    -- Ativos Unidade (Colunas Novas)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ativos_unidade' AND column_name='comprimento_modulo') THEN
        ALTER TABLE ativos_unidade ADD COLUMN comprimento_modulo DECIMAL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ativos_unidade' AND column_name='lista_comprimentos') THEN
        ALTER TABLE ativos_unidade ADD COLUMN lista_comprimentos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ativos_unidade' AND column_name='info_adicional') THEN
        ALTER TABLE ativos_unidade ADD COLUMN info_adicional TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ativos_unidade' AND column_name='localizacao') THEN
        ALTER TABLE ativos_unidade ADD COLUMN localizacao TEXT;
    END IF;

    -- Pecas Modelo (Campos Novos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pecas_modelo' AND column_name='medida') THEN
        ALTER TABLE pecas_modelo ADD COLUMN medida TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pecas_modelo' AND column_name='tipo') THEN
        ALTER TABLE pecas_modelo ADD COLUMN tipo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pecas_modelo' AND column_name='descricao') THEN
        ALTER TABLE pecas_modelo ADD COLUMN descricao TEXT;
    END IF;

    -- Tecnicos (Campos Novos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tecnicos' AND column_name='cargo') THEN
        ALTER TABLE tecnicos ADD COLUMN cargo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tecnicos' AND column_name='escala') THEN
        ALTER TABLE tecnicos ADD COLUMN escala TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tecnicos' AND column_name='horario') THEN
        ALTER TABLE tecnicos ADD COLUMN horario TEXT;
    END IF;

END $$;
