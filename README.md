# FinCore ERP — protótipo de linha de produtos de software

FinCore é um **ERP financeiro para PMEs brasileiras**: contas a pagar e a receber,
conciliação bancária, aprovação por alçada, centros de custo, plano de contas e
relatórios gerenciais.

Este repositório é um **protótipo navegável de linha de produtos**: o mesmo núcleo
é instanciado para quatro clientes com escopos diferentes. As telas, as colunas de
tabela, os blocos de formulário e os itens de menu **mudam em tempo de execução**
conforme as _features_ contratadas pelo tenant e o perfil de acesso do usuário.

- **Publicado em:** https://core-conta-flow.lovable.app
- **Stack:** TanStack Start 1.168 + TanStack Router 1.170, React 19, Tailwind CSS 4,
  shadcn/ui (Radix), lucide-react, sonner.

---

## Como rodar

```bash
npm install
npm run dev          # http://localhost:8080
```

Outros comandos:

```bash
npm run build        # build de produção
npx tsc --noEmit     # checagem de tipos
npm run lint         # eslint
```

---

## Acessos mock

A senha é a mesma para todos. **O e-mail é o que define o perfil de acesso**
carregado na sessão — a tela `/auth` reconhece o e-mail e ativa o perfil
correspondente. O MFA é opcional (qualquer código de 6 dígitos é aceito).

| Usuário        | E-mail                 | Senha        | Perfil              |
| -------------- | ---------------------- | ------------ | ------------------- |
| Marina Duarte  | `marina@fincore.app`   | `fincore123` | Operador financeiro |
| Roberto Tanaka | `roberto@fincore.app`  | `fincore123` | Aprovador           |
| Cláudia Bastos | `claudia@contabil.app` | `fincore123` | Contador externo    |
| Paula Nunes    | `paula@fincore.app`    | `fincore123` | Implantador         |

O perfil também pode ser trocado a qualquer momento pelo **avatar no topo direito**,
sem passar pelo login.

### O que cada perfil vê

| Perfil                  | Escopo                                                                                                                  | Escrita                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Operador financeiro** | Todas as telas contratadas                                                                                              | Sim                                                                                 |
| **Aprovador**           | Dashboard, fila de aprovação, alçadas, relatórios, auditoria                                                            | Sim (aprovar/devolver)                                                              |
| **Contador externo**    | Dashboard, listagens, plano de contas, conciliação, importação, relatórios, exportações, auditoria                      | **Não** — banner "Acesso somente leitura" e botões de criar/editar/inativar ocultos |
| **Implantador**         | Administração: features do tenant, instanciação, ficha, auditoria, integrações, notificações, alçadas, centros de custo | Sim                                                                                 |

> O perfil **Contador externo** só aparece no seletor quando a feature
> `portal_contador` está ativa no tenant (PV4).

---

## As 4 empresas mock e seus perfis de produto

Cada tenant nasce com um conjunto próprio de _features_. Trocar de empresa no topo
troca todo o conjunto — e a interface reage na hora.

| Empresa                           | CNPJ               | Perfil de produto | Features ativas                                                                             | Adaptador | Regime           |
| --------------------------------- | ------------------ | ----------------- | ------------------------------------------------------------------------------------------- | --------- | ---------------- |
| **Padaria Estrela do Sul Ltda**   | 12.345.678/0001-90 | **Essencial**     | _nenhuma_ (só o núcleo)                                                                     | OFX       | Simples Nacional |
| **TransLog Cargas ME**            | 23.456.789/0001-12 | **Profissional**  | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push`, **`mod_comissoes`**           | CNAB 240  | Lucro Presumido  |
| **Clínica Vida Plena S/S**        | 34.567.890/0001-45 | **Contábil**      | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push`, `portal_contador`             | OFX       | Simples Nacional |
| **Metalúrgica Bandeirantes Ltda** | 45.678.901/0001-78 | **Corporativo**   | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push`, `multiempresa`, `api_publica` | CNAB 400  | Lucro Real       |

**Nota sobre o seletor de empresas.** Com `multiempresa` ativa (Metalúrgica) ele é o
controle de produto: alterna entre os CNPJs do grupo e abre a **visão consolidada**.
Sem a feature, o controle de produto some — um cliente de CNPJ único não tem entre o
que alternar. Para que o protótipo continue demonstrável, a troca de tenant segue
acessível no mesmo lugar, mas marcada como **affordance de demonstração** (borda
tracejada + selo `demo`), para não se confundir com a feature.

---

## Features e pontos de variação

| Feature             | PV      | O que muda quando está ativa                                                                                                                      |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conciliacao`       | PV2/PV6 | Grupo "Conciliação" no menu (importar extrato + conciliação) e o relatório _Extrato conciliado_                                                   |
| `alcada`            | PV3     | Grupo "Aprovações"; títulos acima de R$ 10.000 vão à fila. Sem ela, salvam direto em aberto                                                       |
| `centro_custo`      | PV7     | Grupo "Custos", coluna e filtro _Centro de custo_ em contas a pagar, bloco de rateio no formulário, card de inadimplência por centro no dashboard |
| `multiempresa`      | PV7     | Seletor de empresas do produto e visão consolidada do grupo                                                                                       |
| `portal_contador`   | PV4     | Perfil _Contador externo_ no seletor e layout de exportação contábil                                                                              |
| `api_publica`       | PV7     | Item "Central de integrações" com tokens REST e sandbox                                                                                           |
| `notificacoes_push` | PV5     | Canal _Push_ nas notificações e cobrança por push em contas a receber                                                                             |
| `mod_comissoes`     | PV7     | Item "Comissões" — **módulo exclusivo de um único cliente**                                                                                       |

### Pontos de variação (PV1–PV7)

| PV      | Ponto de variação    | Tipo      | Onde é configurado                         | Onde tem efeito                                                 |
| ------- | -------------------- | --------- | ------------------------------------------ | --------------------------------------------------------------- |
| **PV1** | Regime tributário    | Parâmetro | `/configuracoes`, `/onboarding`            | Contas tributárias do plano de contas, estrutura da DRE         |
| **PV2** | Adaptador bancário   | Parâmetro | `/configuracoes`, `/integracoes/adaptador` | Extensão aceita e parser em `/importar-extrato`                 |
| **PV3** | Aprovação por alçada | Feature   | `/configuracoes`                           | `/aprovacoes`, `/alcadas`, salvamento em `/contas-a-pagar`      |
| **PV4** | Portal do contador   | Feature   | `/configuracoes`                           | Seletor de perfil, layout de exportação                         |
| **PV5** | Notificações         | Feature   | `/configuracoes`                           | `/notificacoes`, cobrança em `/contas-a-receber`                |
| **PV6** | Conciliação bancária | Feature   | `/configuracoes`                           | `/importar-extrato`, `/conciliacao`, relatórios                 |
| **PV7** | Escala e extensões   | Composto  | `/configuracoes`                           | Centro de custo, multiempresa, API pública, módulo de comissões |

A ficha consolidada, gerada em tempo real a partir do `FeaturesContext`, está em
**`/instanciacao/resumo`**.

---

## Mapa de rotas

### Telas de negócio (15)

| Rota                | Tela                                                     | Varia por                                                                                                                |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/`                 | Dashboard financeiro                                     | `multiempresa` (consolidado) · `centro_custo` (inadimplência por centro) · `alcada` (KPI de aprovações) · perfil (ações) |
| `/auth`             | Login com MFA opcional e recuperação de senha            | — (define o perfil pelo e-mail)                                                                                          |
| `/onboarding`       | Assistente: empresa → plano de contas por regime → banco | **PV1** (plano sugerido) · **PV2** (adaptador)                                                                           |
| `/contas-a-pagar`   | Listagem + CRUD completo, filtros removíveis, totais     | `centro_custo` (coluna, filtro, rateio) · `alcada` (fila) · perfil                                                       |
| `/baixa-pagamento`  | Baixa com juros, desconto e conta de saída               | `centro_custo` (rateio no resumo) · perfil (indisponível em leitura)                                                     |
| `/contas-a-receber` | Aging de inadimplência em 5 faixas                       | `notificacoes_push` (cobrança) · perfil                                                                                  |
| `/parceiros`        | CRUD completo de clientes e fornecedores                 | perfil · regra de títulos em aberto                                                                                      |
| `/plano-de-contas`  | Árvore sintética/analítica                               | **PV1** (contas do regime) · perfil                                                                                      |
| `/relatorios`       | Catálogo, fluxo projetado, DRE gerencial, exportação     | `centro_custo`, `multiempresa`, `conciliacao`, `portal_contador`                                                         |
| `/importar-extrato` | Upload OFX/CNAB com prévia e validação                   | **PV2** (extensão e parser) · `conciliacao`                                                                              |
| `/conciliacao`      | Pares extrato × sistema com sugestões                    | `conciliacao` · **PV2** · perfil                                                                                         |
| `/aprovacoes`       | Fila de aprovação com fluxo e devolução                  | `alcada` · `centro_custo` (detalhe) · perfil                                                                             |
| `/centros-de-custo` | Cadastro com rateio padrão e valor rateado               | `centro_custo` · perfil                                                                                                  |
| `/rateio`           | Rateio de um título validando 100%                       | `centro_custo` · perfil                                                                                                  |
| `/comissoes`        | **Módulo exclusivo** — comissões sobre recebimentos      | `mod_comissoes` (só TransLog Cargas)                                                                                     |

### Telas administrativas (9)

| Rota                     | Tela                                                                       | Varia por                                                                 |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `/configuracoes`         | **Tela 13** — features do tenant, adaptador, regime, matriz Telas × Perfis | tenant selecionado                                                        |
| `/alcadas`               | Limites de aprovação por perfil e substitutos                              | `alcada` · perfil                                                         |
| `/exportacoes`           | Pacotes de exportação                                                      | `conciliacao`, `centro_custo`, `portal_contador`, `multiempresa`          |
| `/notificacoes`          | Canais por evento e antecedência                                           | **PV5** (coluna Push) · `alcada`, `conciliacao`, `centro_custo` (eventos) |
| `/integracoes`           | Central de integrações: tokens e endpoints                                 | `api_publica` · `centro_custo` (escopo de rateio)                         |
| `/integracoes/adaptador` | Escolha do adaptador bancário                                              | **PV2** · `conciliacao`                                                   |
| `/instanciacao`          | Assistente de instanciação em 7 etapas                                     | features do tenant (etapas 2, 3 e 6)                                      |
| `/instanciacao/resumo`   | Ficha de configuração PV1–PV7                                              | todo o `FeaturesContext`                                                  |
| `/auditoria`             | Trilha de auditoria da sessão                                              | `mod_comissoes` (categoria)                                               |

Total: **24 rotas**, todas alcançáveis pelo menu. Nenhum item de menu sem rota e
nenhum `href="#"`.

---

## Demonstrar a variabilidade em 60 segundos

1. **Trocar empresa → o menu muda.** Comece na _Padaria Estrela do Sul_ (Essencial):
   o menu tem só Operação, Configurações e Administração. Troque para _TransLog
   Cargas_ no seletor do topo — aparecem os grupos **Conciliação**, **Aprovações**,
   **Custos** e **Extensões**, o selo muda para `PROFISSIONAL`, o 4º KPI vira
   "Aguardando aprovação" e surge o bloco de inadimplência por centro de custo.
2. **Tela 13 → desligar Centro de custo → a coluna some.** Vá em _Features do
   tenant_, desligue **Centro de Custo**. Na hora: o grupo "Custos" sai do menu.
   Abra `/contas-a-pagar` — a coluna _Centro de custo_ desapareceu e, em "Nova
   conta", o bloco de rateio foi substituído pela explicação do PV7.
3. **TransLog → aparece Comissões.** Só nesse tenant o item **Comissões** existe no
   menu. Abra e clique em _Gerar título a pagar (comissão)_: o título entra em
   `/contas-a-pagar` marcado com a origem "Módulo de comissões". Em qualquer outro
   tenant, `/comissoes` redireciona para `/` com o aviso "Módulo não contratado".
4. **Trocar perfil para Contador → tudo vira leitura.** No avatar, escolha _Contador
   externo_ (disponível na _Clínica Vida Plena_, que tem `portal_contador`). Aparece
   o banner "Acesso somente leitura", o menu encolhe para as telas permitidas e
   todos os botões de criar, editar e inativar desaparecem.
5. **Ver o rastro.** Abra `/auditoria`: cada troca de feature, CRUD, aprovação e
   geração de título de comissão gravou uma linha com usuário, tenant e detalhe.

O ícone **ⓘ** ao lado do título de cada tela abre um popover explicando **o que
varia ali, por qual feature ou perfil, e qual o ponto de variação**.

---

## Arquitetura da variabilidade

```
src/
  components/app/
    FeaturesContext.tsx   flags por tenant + adaptador (PV2) + regime (PV1)
    PerfilContext.tsx     4 perfis de acesso, lista branca de rotas, modo leitura
    EmpresaContext.tsx    tenant ativo e visão consolidada
    DadosContext.tsx      CRUD em memória de parceiros e títulos
    AuditoriaContext.tsx  trilha de auditoria da sessão
    AppShell.tsx          sidebar e topbar que reagem a features e perfil
    VariabilidadeInfo.tsx popover "o que varia nesta tela"
  modules/comissoes/      MÓDULO EXCLUSIVO — pacote isolado
    dados.ts              tabela própria (vendedores, percentuais, recebimentos)
    tipos.ts              porta PortaNucleo — contrato com o núcleo
    TelaComissoes.tsx     tela do módulo, recebe a porta por props
  routes/comissoes.tsx    única ponte: lê a flag e injeta a porta
```

### Fronteiras do módulo exclusivo

O módulo de comissões (`/comissoes`) é a **função exclusiva de um cliente**
(TransLog Cargas ME) e fica isolado do núcleo por quatro fronteiras:

1. **Pacote separado** — todo o código vive em `src/modules/comissoes/`. Nenhum
   arquivo do núcleo importa dessa pasta.
2. **Tabela própria** — vendedores, percentuais e recebimentos por competência ficam
   em `modules/comissoes/dados.ts`, fora de `src/lib/mock-data.ts`.
3. **Leitura via interface do núcleo** — o módulo declara a porta `PortaNucleo` em
   `tipos.ts`. A rota injeta a implementação; o módulo nunca conhece `TituloPagar`
   nem os contextos do núcleo.
4. **Rota condicional** — `src/routes/comissoes.tsx` é a única ponte: renderiza a
   tela apenas com a flag `mod_comissoes` ativa e, fora dela, redireciona para `/`.

### Design system

O visual é o do **core-conta-flow** (P2): `src/styles.css` define os tokens
shadcn/ui em oklch (`--primary`, `--sidebar`, `--success`, `--warning`,
`--destructive`, `--shadow-card`), com **Manrope** para texto e **IBM Plex Mono**
para números (utilitário `.num`, com `font-variant-numeric: tabular-nums`).

As telas são montadas com os primitivos do shadcn (`Card`, `Table`, `Button`,
`Input`, `Select`, `Sheet`, `Dialog`, `Popover`, `Switch`) e ícones do
**lucide-react**. O shell é a sidebar escura de 256 px com grupos de menu e
barra de acento no item ativo, e a topbar com seletor de empresa, selo do perfil
de produto e seletor de perfil de acesso.

---

## Como publicar

O repositório está conectado ao Lovable e **só a branch `main` é sincronizada**.

1. Commite e envie para `main`.
2. No Lovable, clique em **Publish → Update**.
3. A URL https://core-conta-flow.lovable.app passa a refletir as mudanças.

---

## Limites do protótipo

- Todo o estado vive em memória: recarregar a página restaura os dados mock e
  esvazia a trilha de auditoria.
- Não há backend, autenticação real nem persistência. O login apenas reconhece o
  e-mail e define o perfil da sessão.
- Datas, saldos e recebimentos são fixos (competência junho/2026).
