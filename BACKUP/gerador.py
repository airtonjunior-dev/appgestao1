import pandas as pd
import json
import os
from datetime import datetime
import sys

# Força a saída para UTF-8 para evitar erros de encodamento no console do Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Versões muito antigas de Python


# ==========================================
# CONFIGURAÇÃO DE MAPEAMENTO DO EXCEL
# ==========================================
# Se você mudar o nome de uma aba ou coluna no Excel, altere aqui:
CONFIG = {
    "arquivo_entrada": "Gestao_Manutencao.xlsx",
    "arquivo_saida": "dados.json",
    "abas": {
        "unidades": {
            "nome": "Unidades",
            "colunas": ["SIGLA", "Unidade", "Analista", "Supervisor", "Endereco", "Regional"]
        },
        "esteiras": {
            "nome": "Base_Esteiras",
            "colunas": ["SIGLA", "TAG", "Modelo_Chave", "Qtd_Modulos"]
        },
        "dicionario_tecnico": {
            "nome": "Dicionario_Tecnico",
            "colunas": ["SIGLA", "Modelo_Chave", "Marca", "Item", "Código do Item", "Referência", "Tamanho", "Crítico"]
        },
        "estoque_critico": {
            "nome": "Estoque_Critico",
            "colunas": ["SIGLA", "Componente", "Codigo do Item", "Estoque Real", "Estoque Obrigatorio", "Observacao"]
        },
        "paineis": {
            "nome": "Base_Paineis",
            "colunas": ["SIGLA", "TAG_Painel", "Modelo_Painel", "Localizacao"]
        },
        "dicionario_paineis": {
            "nome": "Dicionario_Paineis",
            "colunas": ["SIGLA", "Modelo_Painel", "Item", "Codigo_Fabricante"]
        },
        "gaiolas": {
            "nome": "Controle_Gaiolas",
            "colunas": ["SIGLA", "Carimbo de data/hora", "Qual seu nome", "Quantas Gaiolas temos pendente na unidade hoje ? (Número)"]
        },
        "links": {
            "nome": "Links",
            "colunas": ["Título", "Texto", "Link"]
        },
        "tecnicos": {
            "nome": "Tecnicos",
            "colunas": ["SIGLA", "Nome", "CPF", "Telefone", "Endereco"]
        }
    }
}

class GeradorDados:
    def __init__(self, config):
        self.config = config
        self.data_frames = {}
        self.output_data = {}

    def carregar_excel(self):
        """Lê o arquivo Excel e armazena as abas configuradas."""
        caminho = self.config["arquivo_entrada"]
        if not os.path.exists(caminho):
            raise FileNotFoundError(f"Arquivo '{caminho}' não encontrado!")

        print(f"📖 Lendo arquivo: {caminho}...")
        xl = pd.ExcelFile(caminho)
        abas_no_arquivo = xl.sheet_names

        for chave, conf_aba in self.config["abas"].items():
            nome_aba = conf_aba["nome"]
            colunas_esperadas = conf_aba["colunas"]

            if nome_aba in abas_no_arquivo:
                df = pd.read_excel(caminho, sheet_name=nome_aba)
                
                # Verifica se as colunas existem
                colunas_faltando = [c for c in colunas_esperadas if c not in df.columns]
                if colunas_faltando:
                    print(f"⚠️ Aviso: Na aba '{nome_aba}', faltam as colunas: {colunas_faltando}")
                
                # Trata datas e valores nulos
                df = self._tratar_dataframe(df)
                self.data_frames[chave] = df
            else:
                print(f"⚠️ Aviso: Aba '{nome_aba}' não encontrada. Criando vazia.")
                self.data_frames[chave] = pd.DataFrame(columns=colunas_esperadas)

    def _tratar_dataframe(self, df):
        """Converte datas para string e preenche valores nulos."""
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].dt.strftime('%d/%m/%Y %H:%M')
        return df.fillna('S/I')

    def processar_bibliotecas(self):
        """Gera os dicionários globais de modelos."""
        print("🔧 Processando bibliotecas técnicas globais...")
        
        # Links Úteis e Gaiolas (Geral)
        self.output_data["links"] = self.data_frames["links"].to_dict(orient='records')
        self.output_data["gaiolas_global"] = self.data_frames["gaiolas"].to_dict(orient='records')

        # Inicializa bibliotecas se ainda não houver
        self.output_data["bib_est"] = {}
        self.output_data["bib_pai"] = {}

        # 1. Carrega todas as peças que possuem SIGLA "GLOBAL" (Essas valem para todos)
        df_dic_est = self.data_frames["dicionario_tecnico"]
        for m in df_dic_est[df_dic_est['SIGLA'].astype(str).str.upper() == 'GLOBAL']['Modelo_Chave'].unique():
            self.output_data["bib_est"][str(m)] = df_dic_est[(df_dic_est['Modelo_Chave'] == m) & (df_dic_est['SIGLA'].astype(str).str.upper() == 'GLOBAL')].to_dict(orient='records')

        df_dic_pai = self.data_frames["dicionario_paineis"]
        for m in df_dic_pai[df_dic_pai['SIGLA'].astype(str).str.upper() == 'GLOBAL']['Modelo_Painel'].unique():
            self.output_data["bib_pai"][str(m)] = df_dic_pai[(df_dic_pai['Modelo_Painel'] == m) & (df_dic_pai['SIGLA'].astype(str).str.upper() == 'GLOBAL')].to_dict(orient='records')


    def processar_unidades(self):
        """Vincula todos os dados à Chave Mestra 'SIGLA'."""
        print("🏢 Processando dados das unidades...")
        
        df_uni = self.data_frames["unidades"]
        df_est = self.data_frames["esteiras"]
        df_pai = self.data_frames["paineis"]
        df_sto = self.data_frames["estoque_critico"]
        df_dic_est = self.data_frames["dicionario_tecnico"]
        df_dic_pai = self.data_frames["dicionario_paineis"]
        df_tec = self.data_frames.get("tecnicos", pd.DataFrame(columns=self.config["abas"]["tecnicos"]["colunas"]))

        # Mantenha os dados já carregados em processar_bibliotecas
        unidades_lista = []
        for _, u in df_uni.iterrows():
            sigla = str(u['SIGLA']).strip().upper()
            
            # 2. Se a unidade tiver peças exclusivas para um modelo (Além do Global ou no lugar dele),
            # nós complementamos aqui. Isso permite que a unidade tenha "peças especiais".
            for m in df_est[df_est['SIGLA'] == sigla]['Modelo_Chave'].unique():
                pecas_unid = df_dic_est[(df_dic_est['Modelo_Chave'] == m) & (df_dic_est['SIGLA'] == sigla)].to_dict(orient='records')
                if pecas_unid:
                    # Se já existe o modelo no global, adicionamos as peças locais
                    if str(m) in self.output_data["bib_est"]:
                        # Evita duplicatas se o usuário repetiu (opcional, mas seguro)
                        self.output_data["bib_est"][str(m)].extend(pecas_unid)
                    else:
                        self.output_data["bib_est"][str(m)] = pecas_unid

            for m in df_pai[df_pai['SIGLA'] == sigla]['Modelo_Painel'].unique():
                pecas_unid_pai = df_dic_pai[(df_dic_pai['Modelo_Painel'] == m) & (df_dic_pai['SIGLA'] == sigla)].to_dict(orient='records')
                if pecas_unid_pai:
                    if str(m) in self.output_data["bib_pai"]:
                        self.output_data["bib_pai"][str(m)].extend(pecas_unid_pai)
                    else:
                        self.output_data["bib_pai"][str(m)] = pecas_unid_pai


            unidade_dict = {
                "Sigla": sigla,
                "Unidade": str(u['Unidade']),
                "Regional": str(u['Regional']).strip().upper(),
                "Analista": str(u['Analista']),
                "Supervisor": str(u['Supervisor']),
                "Endereco": str(u['Endereco']),
                
                # Filtra pela Chave Mestra 'SIGLA'
                "esteiras": df_est[df_est['SIGLA'] == sigla].to_dict(orient='records'),
                "paineis_unid": df_pai[df_pai['SIGLA'] == sigla].to_dict(orient='records'),
                "tecnicos": df_tec[df_tec['SIGLA'] == sigla].to_dict(orient='records'),
                
                # Mapeia colunas amigáveis do Excel para as chaves que o index.html espera
                "estoque": [
                    {
                        "Componente": item.get("Componente", "S/I"),
                        "Codigo_Item": item.get("Codigo do Item", "S/I"),
                        "Estoque_Real": item.get("Estoque Real", 0),
                        "Estoque_Obrigatorio": item.get("Estoque Obrigatorio", 0),
                        "Observacao": item.get("Observacao", "S/I")
                    } 
                    for item in df_sto[df_sto['SIGLA'] == sigla].to_dict(orient='records')
                ]
            }
            unidades_lista.append(unidade_dict)
        
        self.output_data["unidades"] = unidades_lista

    def validar_siglas(self):
        """Verifica se existem siglas nas abas filhas que não estão cadastradas em Unidades."""
        siglas_mestre = set(self.data_frames["unidades"]["SIGLA"].str.strip().str.upper())
        for chave, df in self.data_frames.items():
            if chave == "unidades" or "SIGLA" not in df.columns:
                continue
            
            siglas_aba = {s for s in df["SIGLA"].str.strip().str.upper() if s != 'GLOBAL'}
            diferenca = siglas_aba - siglas_mestre
            if diferenca:
                print(f"❌ ERRO NA ABA '{self.config['abas'][chave]['nome']}': As siglas {diferenca} não existem na aba Unidades!")

    def salvar(self):
        """Exporta o resultado final para JSON."""
        caminho_saida = self.config["arquivo_saida"]
        with open(caminho_saida, 'w', encoding='utf-8') as f:
            json.dump(self.output_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Sucesso! Arquivo '{caminho_saida}' atualizado.")

def executar():
    gerador = GeradorDados(CONFIG)
    try:
        gerador.carregar_excel()
        gerador.validar_siglas()
        gerador.processar_bibliotecas()
        gerador.processar_unidades()
        gerador.salvar()
    except Exception as e:
        print(f"❌ Erro crítico: {e}")

if __name__ == "__main__":
    executar()