# FinCore Flow

Estou construindo o FinCore, um ERP financeiro web para pequenas e médias empresas brasileiras (contas a pagar e a receber, conciliação bancária, fluxo de caixa e relatórios gerenciais). Já existe um protótipo navegável com 15 telas do núcleo do sistema, feito aqui no Lovable, neste link de referência visual e de padrão de componentes (mantenha a mesma paleta, tipografia, componentes de formulário, tabela e navegação lateral que ele usa):

`https://lovable.dev/projects/256d6f05-969a-40e8-be40-80a1b58a1d5c`

O sistema é multiempresa (multi-tenant): cada cliente pode ativar ou não um conjunto de "pontos de variação" na contratação. As 15 telas do núcleo já cobrem cadastro de empresa, usuário, cliente/fornecedor, plano de contas, conta bancária, contas a pagar e a receber, baixa e dashboard. Preciso agora que você gere **14 telas novas**, que dão interface aos pontos de variação e a duas capacidades do núcleo ainda não prototipadas. Gere todas em um único fluxo coerente, reaproveitando os mesmos componentes visuais do protótipo de referência (cards, tabelas com filtro, formulários em modal ou painel lateral, badges de status, mesma cor de destaque para ações primárias).

Use dados fictícios plausíveis em português do Brasil (nomes de empresas, valores em reais, datas de 2026) para popular listas e exemplos em cada tela.

## Telas a criar

**1. Importar extrato bancário** (ponto de variação pv1)

Tela de upload de arquivo (aceita .ofx e .cnab), com área de arrastar-e-soltar, botão de selecionar arquivo, e depois do upload uma prévia em tabela das linhas lidas (data, descrição, valor, tipo). Linhas com erro de leitura aparecem destacadas em vermelho com a mensagem do erro na própria linha. Botão "Confirmar importação" só habilita se houver ao menos uma linha válida.

**2. Conciliação bancária** (pv2)

Tela dividida em duas colunas: à esquerda, lançamentos importados do extrato; à direita, lançamentos já registrados no sistema. O sistema sugere pares prováveis (mesma data/valor aproximado) com uma linha conectando os dois lados e um botão "Conciliar". Lançamentos já conciliados ficam esmaecidos com um selo verde "Conciliado" e um botão "Desfazer".

**3. Fila de aprovação de pagamentos** (pv3)

Lista de títulos a pagar que estão acima da alçada do operador, aguardando aprovação. Cada linha mostra fornecedor, valor, vencimento e quem lançou. Botões "Aprovar" e "Devolver"; ao clicar em "Devolver" abre um campo obrigatório de justificativa antes de confirmar.

**4. Configurar alçada** (pv3)

Tela de configuração com uma tabela de perfis de usuário e, para cada um, um campo de valor-limite de aprovação automática. Campo adicional para indicar um "aprovador substituto" que assume quando o titular está ausente.

**5. Exportar dados e relatórios** (pv4)

Tela simples com seletor de período (data inicial/final), seletor de formato (PDF, XLSX, CSV) e seletor de layout (padrão do sistema ou layout do escritório de contabilidade). Botão "Gerar exportação" e uma lista abaixo com o histórico das últimas exportações geradas, com link de download.

**6. Centro de custo** (pv7)

Tela de cadastro (lista + formulário) de centros de custo: código, descrição, responsável (selecionado entre os usuários), e um campo de "rateio padrão" em percentual. Lista mostra o total lançado no centro no mês corrente.

**7. Rateio de título** (pv7)

Modal ou painel que abre a partir de um título a pagar, permitindo dividir o valor entre dois ou mais centros de custo, cada um com seu percentual. Mostra a soma dos percentuais em tempo real e impede salvar se não somar 100%.

**8. Configurações de notificação** (pv5)

Tela de preferências com uma lista de tipos de evento (vencimento próximo, pendência de aprovação, falha de importação) e, para cada um, toggles para canal e-mail e canal sistema, mais um campo numérico de "dias de antecedência".

**9. Central de integrações** (pv6)

Lista de integrações configuradas, cada uma com ícone do tipo (banco, sistema contábil, provedor de notificação, consulta cadastral), nome, status (conectado / com erro / desativado) e botão "Configurar". Botão "Adicionar integração" no topo.

**10. Configurar adaptador de integração** (pv6)

Formulário que muda de acordo com o tipo de integração escolhido (use um seletor no topo): campos de credencial e endpoint para "bancário" e "contábil"; campos de chave de API para "notificação" e "consulta cadastral". Botão "Testar conexão" antes de salvar.

**11. Assistente de instanciação de cliente** (processo de onboarding do time de implantação, não é uma tela do cliente final)

Wizard de várias etapas para o time interno configurar um cliente novo: uma etapa lista os sete pontos de variação (importar extrato, conciliação automática, aprovação por alçada, exportação contábil, canal de notificação, adaptador de integração, centro de custo) cada um com um toggle de habilitado/desabilitado e uma frase curta explicando quando faz sentido ativar.

**12. Resumo da ficha de configuração** (última etapa do wizard acima)

Tela de revisão mostrando, em formato de lista, todas as features escolhidas no assistente antes de confirmar e provisionar o ambiente do cliente. Botão final "Provisionar ambiente".

**13. Trilha de auditoria**

Tela de histórico com tabela filtrável por usuário, período e tipo de operação (criação, alteração, exclusão lógica). Cada linha expande para mostrar o valor anterior e o novo valor do campo alterado.

**14. Troca de contexto entre empresas**

Um seletor no cabeçalho (dropdown) listando as empresas do grupo que o usuário logado pode acessar; ao trocar, o dashboard mostra os dados daquela empresa, e uma opção adicional "Visão consolidada do grupo" soma os números de todas.

## Observações finais para o Lovable

* Mantenha a navegação lateral existente e adicione as novas telas como itens de menu agrupados logicamente (ex.: um grupo "Conciliação", um grupo "Configurações", um grupo "Administração").

* Todas as telas devem ser responsivas, seguindo o mesmo breakpoint do protótipo original.

* Não é necessário conectar a um backend real — assim como no protótipo da Parte I, use dados mockados no próprio front-end.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://core-conta-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/33a7c77f-36cc-4365-a27e-2eb95e7b96b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
