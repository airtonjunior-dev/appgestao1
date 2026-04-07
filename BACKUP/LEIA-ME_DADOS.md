# Guia de Alimentação de Dados - Painel de Manutenção

Para que o painel funcione corretamente, o arquivo **`Gestao_Manutencao.xlsx`** deve conter as seguintes abas e colunas (os nomes devem ser exatos):

---

## 🏢 1. Unidades
Define as unidades que aparecerão no menu lateral.
- **Sigla**: Ex: POA, CAN, VIM (Único por unidade)
- **Unidade**: Nome completo da unidade
- **Regional**: SUL, NORTE, etc.
- **Analista**: Nome do analista responsável
- **Supervisor**: Nome do supervisor responsável
- **Endereco**: Endereço completo da unidade

## 👥 2. Tecnicos (Nova!)
Lista os colaboradores alocados em cada unidade.
- **Sigla_Unidade**: Deve ser igual à **Sigla** da aba Unidades
- **Nome**: Nome completo do técnico
- **CPF**: CPF do colaborador
- **Telefone**: Telefone de contato
- **Endereco**: Endereço do colaborador

## 🚜 3. Base_Esteiras
Lista as esteiras de cada unidade.
- **Sigla_Unidade**: Sigla da unidade
- **TAG**: Nome da esteira (ex: EST-01)
- **Modelo_Chave**: Código do modelo (deve existir na aba Dicionario_Tecnico)
- **Qtd_Modulos**: Quantidade de módulos

## ⚡ 4. Base_Paineis
Lista os painéis elétricos de cada unidade.
- **Sigla_Unidade**: Sigla da unidade
- **TAG_Painel**: Nome do painel (ex: PNL-01)
- **Modelo_Painel**: Código do modelo (deve existir na aba Dicionario_Paineis)

## 📦 5. Estoque_Critico (Nova Estrutura!)
Informa o que a unidade tem versus o que ela **precisa** ter.
- **Sigla_Unidade**: Sigla da unidade (POA, CAN, etc.)
- **Componente**: Nome da peça ou item (ex: Sensor Indutivo)
- **Codigo_Item**: Código Klassmatt
- **Estoque_Real**: Quantidade física atual na unidade
- **Estoque_Obrigatorio**: Quantidade mínima que a unidade deve manter
- **Observacao**: Informações extras (ex: "Pedido #123 em andamento")

> **Dica:** O painel mostrará em **vermelho** automático os itens onde o **Real é menor que o Obrigatório**.

---

## 📖 Dicionários (DNA dos Equipamentos)
Estas abas definem quais peças compõem cada modelo de equipamento.

### Dicionario_Tecnico (Para Esteiras)
- **Modelo_Chave**, **Item**, **Codigo**, **Referencia**

### Dicionario_Paineis (Para Painéis)
- **Modelo_Painel**, **Item**, **Codigo_Fabricante**

---

## 🔗 Outras Abas
- **Controle_Gaiolas**: Histórico de pendências (Carimbo, Unidade, Quantidade).
- **Links**: Título, Texto e Link para atalhos na barra lateral.

---

### 💡 Dica:
Sempre que alterar o Excel, salve o arquivo e execute o script `gerador.py` para atualizar o painel.
