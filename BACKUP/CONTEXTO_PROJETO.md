# Contexto do Projeto - Painel de Manutenção

Este projeto consiste em um painel de indicadores para gestão de manutenção (GPS MAINTENANCE SUL).

## Componentes do Projeto
- **Excel (`Gestao_Manutencao.xlsx`)**: Fonte de dados principal com abas para unidades, esteiras, painéis, técnicos, estoque e pendências de gaiolas.
- **Python (`gerador.py`)**: Script responsável por ler o Excel e converter os dados em um arquivo JSON.
- **Web Dashboard (`index.html`)**: Interface que consome o `dados.json` para exibir os indicadores.

## 🌟 Nova Funcionalidade: Bibliotecas Globais
Para facilitar o trabalho do coordenador e evitar redigitar as mesmas peças para unidades diferentes, implementamos o sistema de **Sigla Global**:

1.  **Dicionário de Peças**: No Excel, nas abas `Dicionario_Tecnico` e `Dicionario_Paineis`, você pode cadastrar um modelo usando a sigla **`GLOBAL`**.
2.  **Vínculo Automático**: Todas as unidades que possuírem equipamentos com esse `Modelo_Chave` herdarão automaticamente a lista de peças cadastradas como global.
3.  **Personalização**: Se uma unidade tiver peças exclusivas que outras não têm, basta cadastrar essas peças com a **Sigla da Unidade** no dicionário. O sistema irá somar as peças globais com as peças específicas daquela unidade.

## 🛠️ Central de Gestão & Catálogo Global
O portal evoluiu para uma ferramenta de gestão interativa:
- **Catálogo de Esteiras/Painéis**: Visualização consolidada de todos os modelos do contrato.
- **Edição no HTML**: Possibilidade de adicionar novos modelos e peças diretamente na interface.
- **Propagação de Criticidade**: Ao alterar a criticidade de um item no catálogo, todas as unidades que utilizam aquele modelo são atualizadas instantaneamente.
- **Manuais Técnicos**: Suporte a links de manuais em PDF diretamente nos cards de equipamento.
- **Exportação de Dados**: Botão "Exportar Alterações" que gera um novo `dados.json` com as mudanças feitas na interface.

## Status Atual
- O script `gerador.py` foi executado com sucesso e os dados foram sincronizados com o `dados.json`.
- O servidor local foi iniciado na porta 8000.
- O dashboard foi verificado e está carregando corretamente todas as informações de unidades e pendências de gaiolas.

## Como executar
1. Abra o Terminal e rode: `python gerador.py`
2. Inicie um servidor local: `python -m http.server 8000`
3. Acesse no navegador: `http://localhost:8000/index.html`

## Estrutura Recomendada para o Excel
| Aba | Coluna SIGLA | Uso Recomendado |
| :--- | :--- | :--- |
| **Unidades** | (Ex: RS01) | Cadastro mestre da unidade. |
| **Dicionario** | **GLOBAL** | Cadastre aqui modelos que se repetem em várias unidades. |
| **Dicionario** | (Ex: RS01) | Use apenas para peças que só existem naquela unidade específica. |
| **Base_Esteiras** | (Ex: RS01) | Apenas informe qual o `Modelo_Chave` a unidade possui. |
