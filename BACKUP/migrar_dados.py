import pandas as pd
import os
from supabase import create_client, Client
import json
import sys

# Força a saída para UTF-8 para evitar erros de encodamento no console do Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Versões muito antigas de Python


# ==========================================
# CONFIGURAÇÃO SUPABASE
# ==========================================
SUPABASE_URL = "https://lmhzwaymhlfxlettrbkk.supabase.co"
# ATENÇÃO: Para migração (escrita), é recomendado usar a SERVICE_ROLE_KEY
# Se estiver usando a Anon Key, certifique-se de que o RLS está desabilitado ou permite escrita.
SUPABASE_KEY = "sb_publishable_LXNggTYlRoCDcD4LyuP9Sg_8T6aX94e" 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

EXCEL_FILE = "Gestao_Manutencao.xlsx"

def migrar_unidades():
    print("🏢 Migrando Unidades...")
    df = pd.read_excel(EXCEL_FILE, sheet_name="Unidades")
    for _, row in df.iterrows():
        data = {
            "sigla": str(row["SIGLA"]).strip().upper(),
            "nome": str(row["Unidade"]),
            "regional": str(row["Regional"]).strip().upper(),
            "analista": str(row["Analista"]),
            "supervisor": str(row["Supervisor"]),
            "endereco": str(row["Endereco"])
        }
        supabase.table("unidades").upsert(data).execute()

def migrar_catalogos():
    print("🔧 Migrando Catálogo de Equipamentos e Peças...")
    
    # 1. Esteiras
    df_est = pd.read_excel(EXCEL_FILE, sheet_name="Dicionario_Tecnico")
    # Filtra modelos únicos (Global)
    modelos = df_est["Modelo_Chave"].unique()
    for m in modelos:
        # Pega a marca do primeiro item do modelo
        marca = df_est[df_est["Modelo_Chave"] == m]["Marca"].iloc[0] if "Marca" in df_est.columns else "S/I"
        
        # Insere Modelo
        res = supabase.table("modelos_equipamento").upsert({
            "modelo_chave": str(m),
            "tipo": "esteira",
            "marca": str(marca)
        }).execute()
        
        modelo_id = res.data[0]["id"]
        
        # Insere Peças do Modelo
        pecas = df_est[df_est["Modelo_Chave"] == m]
        for _, p in pecas.iterrows():
            peca_data = {
                "modelo_id": modelo_id,
                "item": str(p["Item"]),
                "codigo_item": str(p["Código do Item"]),
                "referencia": str(p["Referência"]) if "Referência" in p else "",
                "tamanho": str(p["Tamanho"]) if "Tamanho" in p else "",
                "medida": str(p["Medida"]) if "Medida" in p else "",
                "tipo": str(p["Tipo"]) if "Tipo" in p else "Geral",
                "is_critico": str(p["Crítico"]).upper() in ["SIM", "S", "TRUE"]
            }
            supabase.table("pecas_modelo").upsert(peca_data).execute()

def migrar_ativos():
    print("🚜 Migrando Ativos Instalados (Esteiras)...")
    df = pd.read_excel(EXCEL_FILE, sheet_name="Base_Esteiras")
    
    # Busca IDs dos modelos para vincular
    modelos_res = supabase.table("modelos_equipamento").select("id, modelo_chave").execute()
    modelos_map = {m["modelo_chave"]: m["id"] for m in modelos_res.data}
    
    for _, row in df.iterrows():
        m_chave = str(row["Modelo_Chave"])
        if m_chave in modelos_map:
            data = {
                "sigla_unidade": str(row["SIGLA"]).strip().upper(),
                "tag": str(row["TAG"]),
                "modelo_id": modelos_map[m_chave],
                "qtd_modulos": int(row["Qtd_Modulos"]),
                "comprimento_modulo": float(row["Comprimento"]) if "Comprimento" in row and not pd.isna(row["Comprimento"]) else 0,
                "info_adicional": str(row["Informacao_Adicional"]) if "Informacao_Adicional" in row and not pd.isna(row["Informacao_Adicional"]) else ""
            }
            supabase.table("ativos_unidade").upsert(data).execute()

def executar_migracao():
    try:
        migrar_unidades()
        migrar_catalogos()
        migrar_ativos()
        # Adicione outras tabelas conforme necessário (Técnicos, Links, etc.)
        print("✅ Migração concluída com sucesso!")
    except Exception as e:
        print(f"❌ Erro na migração: {e}")

if __name__ == "__main__":
    executar_migracao()
