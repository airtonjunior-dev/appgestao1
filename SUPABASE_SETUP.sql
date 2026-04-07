-- SUPABASE SETUP - Painel de Manutenção (GPS)

-- 1. Tabelas de Unidades
CREATE TABLE unidades (
    sigla TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    regional TEXT,
    analista TEXT,
    supervisor TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Catálogo Global de Equipamentos (O "DNA" das máquinas)
CREATE TABLE modelos_equipamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_chave TEXT UNIQUE NOT NULL, -- Ex: EST-PADRAO-01
    tipo TEXT CHECK (tipo IN ('esteira', 'painel')),
    marca TEXT,
    manual_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Peças Técnicas de cada Modelo (Biblioteca Global)
CREATE TABLE pecas_modelo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_id UUID REFERENCES modelos_equipamento(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    codigo_item TEXT,
    referencia TEXT,
    tamanho TEXT,
    is_critico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Ativos Instalados nas Unidades (Atribuição de Modelos às Unitades)
CREATE TABLE ativos_unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    tag TEXT NOT NULL, -- Ex: EST-01, PNL-B
    modelo_id UUID REFERENCES modelos_equipamento(id),
    qtd_modulos INTEGER, -- Apenas para Esteiras
    localizacao TEXT, -- Apenas para Painéis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Controle de Estoque (Real vs Obrigatório)
CREATE TABLE estoque_unidade (
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
CREATE TABLE tecnicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Histórico de Pendências (Gaiolas)
CREATE TABLE historico_gaiolas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_unidade TEXT REFERENCES unidades(sigla) ON DELETE CASCADE,
    tecnico_nome TEXT,
    quantidade INTEGER DEFAULT 0,
    carimbo_data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Links Úteis
CREATE TABLE links_uteis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    texto TEXT,
    url TEXT NOT NULL
);

-- 🗂️ Políticas de Segurança Básicas (RLS) - Opcional habilitar no Portal
-- ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Acesso público aos dados" ON unidades FOR SELECT USING (true);
