# Contexto do Projeto - Sistema de Gestão

## Progresso Recente
- **28/04/2026**: Ajustada a lógica de importação de planilhas (`BulkImport.jsx`) para reconhecer corretamente as colunas "Estoque Real", "Estoque Mínimo", "Código", etc. geradas pela exportação do sistema.
- Com isso, os itens importados da planilha passam a ter suas quantidades corretas cadastradas no banco, deixando de aparecer como "0/0" no portal.
- Como consequência, itens importados que estão abaixo do estoque mínimo passam a aparecer **automaticamente** na "Lista de Compras", validando-os de forma imediata sem necessidade de edição manual e salvamento.

- **29/04/2026**: Adicionada a nova aba "Estoque" dentro do Dashboard da Unidade.
- A aba "Estoque" lista todo o inventário da unidade de forma independente da lista de compras.
- Instalada a biblioteca `qrcode.react` para gerar um QR Code único para cada unidade contendo a URL com parâmetros (ex: `/?unit=SSC1&tab=estoque`).
- O app agora lê parâmetros da URL (`URLSearchParams`) para abrir automaticamente a unidade e a aba corretas quando um técnico escanear o código.
- Implementada estilização `@media print` (classes Tailwind `print:`) para criar um layout de impressão limpo contendo apenas o QR Code e a tabela do inventário, ocultando botões, menus laterais e outros elementos de navegação.
- **Segurança e Modo Quiosque**: Adicionada tela de login com senha geral (padrão inicial: `admin123`) para proteger o acesso ao painel de administração e edições.
- A URL do QR Code gerado agora possui a flag `&kiosk=true`. Isso libera o acesso do técnico **diretamente à lista de estoque para impressão** sem pedir senha, mas remove completamente a interface lateral (Sidebar), barra de guias e botões do topo para evitar navegação não autorizada pelo sistema.

- **30/04/2026**: Implementação do **Formulário de Entrada de Peças Integrado** para técnicos.
- Criado o componente isolado `TechnicianForm.jsx` que atua como um "Google Forms", porém conectado diretamente ao Supabase.
- Quando acessado via `/?view=form&unit=SIGLA`, ele exibe uma interface limpa amigável para celular, ignora a necessidade de login e já lista no campo "TAG" apenas os equipamentos reais daquela unidade.
- Adicionado o botão "Abrir Formulário do Técnico" no painel da unidade para você extrair e enviar o link facilmente aos técnicos.
