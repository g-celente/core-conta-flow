# FinCore ERP

Protótipo de ERP financeiro para PMEs brasileiras (contas a pagar, conciliação bancária,
aprovação por alçada, centros de custo e plano de contas). O mesmo sistema atende quatro
clientes (tenants) com escopos diferentes: telas, regras e integrações mudam conforme as
features contratadas por cada um.

Este repositório é o trabalho de **Reuso de Software**: três padrões de projeto do GoF, com
dois exemplos cada, aplicados em fluxos reais do sistema, sobre um conjunto de classes de
domínio.

| Requisito do trabalho                                                                | Onde está                                                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Ao menos 10 classes principais, com atributos e métodos                              | 11 classes em `backend/.../domain/` ([Classes de domínio](#classes-de-domínio))                   |
| Factory Method, 2 exemplos                                                           | Leitor de extrato e plano de contas ([Factory Method](#factory-method))                           |
| Decorator, 2 exemplos                                                                | Valor da baixa e validação do título ([Decorator](#decorator))                                    |
| Chain of Responsibility, 2 exemplos                                                  | Aprovação por alçada e canal de notificação ([Chain of Responsibility](#chain-of-responsibility)) |
| Item 02 (LPS): 2 telas de CRUD com banco por integrante (10), a partir de 3+ tabelas | 10 cadastros gravados no Postgres ([Cadastros](#cadastros-item-02))                               |
| Item 02 (LPS): exemplo de variabilidade planejada                                    | Features por tenant ([Tenants de exemplo](#tenants-de-exemplo))                                   |

## Sumário

- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar](#como-rodar)
- [Tenants de exemplo](#tenants-de-exemplo)
- [Classes de domínio](#classes-de-domínio)
- [Padrões de projeto](#padrões-de-projeto)
  - [Factory Method](#factory-method)
  - [Decorator](#decorator)
  - [Chain of Responsibility](#chain-of-responsibility)
- [Cadastros (item 02)](#cadastros-item-02)
- [Empacotamento (item 03)](#empacotamento-item-03)
- [Testes](#testes)
- [Roteiro de demonstração](#roteiro-de-demonstração)

## Arquitetura

```mermaid
flowchart LR
    subgraph navegador ["Navegador"]
        T["Telas React"] --> A["src/lib/api.ts"]
    end
    subgraph backend ["Backend Spring Boot"]
        C["Controllers"] --> S["Services"]
        S --> P["Classes do padrão"]
        P --> D["Classes de domínio"]
        S --> R["Repositórios JPA"]
        C -- "cadastros" --> R
    end
    A -- "HTTP JSON, porta 8081" --> C
    R --> DB[("Postgres, porta 5434")]
```

- **Frontend** (`frontend/`): TanStack Start + React. Lê e grava os 10 cadastros pela API e
  chama a API sempre que uma tela precisa de uma regra dos padrões; a configuração dos tenants
  (features, adaptador, regime) e os dados de dashboard e relatórios continuam em memória.
- **Backend** (`backend/`): Spring Boot 4.1 com Java 21. Os fluxos dos padrões não guardam
  estado: cada requisição traz o que precisa (features do tenant, regime, adaptador, valores do
  formulário). Em cada
  fluxo, o **service é o cliente do padrão**: cria os objetos com `new`, monta a
  estrutura do padrão e devolve o resultado. O controller só recebe a requisição, converte os
  dados para as classes de domínio, chama o service e monta a resposta JSON. Os cadastros não
  têm service: o `CrudController` usa o repositório direto.
- **Banco** (Postgres via Docker, sem volume): guarda os 10 cadastros (13 tabelas), entre
  eles o plano de contas base e a escada de alçadas que os padrões leem. Os dados iniciais são
  recarregados pelo `data.sql` a cada subida.

## Estrutura do repositório

```
core-conta-flow/
  frontend/                      app React (telas, dados de exemplo, variabilidade)
    src/lib/api.ts               cliente da API: uma função por fluxo + CRUD genérico
    src/lib/use-cadastro.ts      hook do CRUD genérico (lista e grava um recurso)
    src/components/app/          TelaCadastro e FormularioCadastro (telas de cadastro genéricas)
    src/routes/                  telas (importar-extrato, plano-de-contas, baixa-pagamento...)
  backend/
    pom.xml                      versão, licença e empacotamento (JAR comum + JAR executável)
    docker-compose.yml           Postgres na porta 5434
    src/main/resources/data.sql  dados iniciais dos 10 cadastros
    src/main/java/com/fincore/
      FincoreApplication.java    classe principal do Spring Boot
      controller/                16 controllers (6 dos padrões + 10 cadastros), CrudController, TratamentoDeErros
      service/                   6 services, clientes dos padrões
      repository/                10 repositórios JPA
      domain/                    classes de domínio, entidades dos cadastros e Moeda
      pattern/                   classes dos padrões
        extrato/                 Factory Method 1
        planodecontas/           Factory Method 2
        baixa/                   Decorator 1
        validacao/               Decorator 2
        aprovacao/               Chain of Responsibility 1
        notificacao/             Chain of Responsibility 2
    src/test/java/com/fincore/   um teste JUnit por padrão + CadastroTest
  LICENSE                        licença MIT do artefato
```

## Como rodar

Requisitos: Docker, Java 21, Maven 3.9 e Node.js.

```bash
cd backend
docker compose up -d      # Postgres na porta 5434 (sem volume)
mvn spring-boot:run       # API em http://localhost:8081/api
mvn test                  # testes dos padrões e dos cadastros (não precisam do Docker)

cd ../frontend
npm install
npm run dev               # http://localhost:8080
```

Sem o backend, as telas abrem, mas os fluxos que usam os padrões mostram o aviso
"Backend indisponível em localhost:8081" e não deixam salvar.

## Tenants de exemplo

A empresa ativa é trocada pelo botão no topo da tela. As features de cada tenant podem ser
ligadas e desligadas em **Administração → Features do tenant**, e os padrões reagem na hora.

| Tenant                   | Adaptador bancário | Regime           | Features relevantes para os padrões                          |
| ------------------------ | ------------------ | ---------------- | ------------------------------------------------------------ |
| Padaria Estrela do Sul   | OFX                | Simples Nacional | nenhuma                                                      |
| TransLog Cargas          | CNAB240            | Lucro Presumido  | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push` |
| Clínica Vida Plena       | OFX                | Simples Nacional | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push` |
| Metalúrgica Bandeirantes | CNAB400            | Lucro Real       | `conciliacao`, `alcada`, `centro_custo`, `notificacoes_push` |

## Classes de domínio

Pacote `com.fincore.domain`, o mesmo das entidades dos cadastros e de `Moeda`. Todas têm
atributos privados e getters, sem setters, e cada método listado é usado por algum fluxo.

| Classe                | Atributos                                        | Métodos                              | Usada em                  |
| --------------------- | ------------------------------------------------ | ------------------------------------ | ------------------------- |
| `ConfiguracaoTenant`  | features                                         | `possui(feature)`                    | validação, notificação    |
| `TituloPagar`         | documento, parceiroId, vencimento, valor, rateio | `temValorPositivo()`                 | validação, baixa          |
| `Rateio`              | linhas                                           | `somaPercentual()`, `estaCompleto()` | validação                 |
| `LinhaRateio`         | centroId, percentual                             | getters                              | validação, contas a pagar |
| `BaixaTitulo`         | data, valorPago, juros, desconto, conta          | `temJuros()`, `temDesconto()`        | baixa, contas a pagar     |
| `Alcada` (tabela)     | id, perfil, titular, limite, substituto          | `exigeAprovacao(valor)`              | aprovação, validação      |
| `ContaPlano` (tabela) | id, codigo, descricao, nivel, tipo, saldo, grupo | getters                              | plano de contas           |
| `LinhaExtrato`        | linha, data, descricao, valor, tipo, erro        | `ehValida()`, `rejeitar(motivo)`     | extrato                   |
| `ArquivoExtrato`      | nome, conteudo                                   | `temExtensao(ext)`, `registros()`    | extrato                   |
| `Notificacao`         | destinatario, mensagem, evento                   | `resumo(limite)`                     | notificação               |
| `PedidoAprovacao`     | documento, valor, solicitante                    | `foiLancadoPor(usuario)`             | aprovação                 |

`AlcadaRepository` e `ContaPlanoRepository` (Spring Data JPA, pacote `repository`) leem as duas
tabelas.

## Padrões de projeto

O problema que cada padrão resolve e como ele resolve, com trechos do código, estão em
[Design_Patterns.md](Design_Patterns.md). Abaixo, os fluxos de cada exemplo.

| Padrão                  | Exemplo                         | Pacote                  | Endpoint                                                             | Tela                                            |
| ----------------------- | ------------------------------- | ----------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| Factory Method          | Leitor de extrato por adaptador | `pattern/extrato`       | `GET /api/extrato/formato/{adaptador}`, `POST /api/extrato/importar` | Importar extrato                                |
| Factory Method          | Plano de contas por regime      | `pattern/planodecontas` | `GET /api/plano-de-contas?regime=`                                   | Plano de contas, Onboarding                     |
| Decorator               | Valor devido na baixa           | `pattern/baixa`         | `POST /api/baixa/valor-devido`                                       | Baixa de pagamento                              |
| Decorator               | Validação do título por feature | `pattern/validacao`     | `POST /api/titulos/validar`                                          | Contas a pagar, Rateio                          |
| Chain of Responsibility | Aprovação por alçada            | `pattern/aprovacao`     | `POST /api/aprovacoes/responsaveis`                                  | Contas a pagar, Fila de aprovação               |
| Chain of Responsibility | Canal de notificação            | `pattern/notificacao`   | `POST /api/notificacoes/enviar`                                      | Contas a pagar, Fila de aprovação, Notificações |

---

### Factory Method

> Uma classe **criadora** define o fluxo de trabalho e declara um **método fábrica**; cada
> subclasse decide qual **produto** concreto criar. O fluxo é escrito uma vez só e funciona
> com qualquer produto.

#### Exemplo 1: leitor de extrato por adaptador bancário

**Problema.** Cada banco entrega o extrato num formato diferente (OFX, CNAB 240 ou CNAB 400),
mas o fluxo de importação é sempre o mesmo: aceitar só a extensão do adaptador, ler as
linhas, rejeitar datas inexistentes e devolver a prévia.

| Papel           | Classe                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------- |
| Product         | `LeitorExtrato` (interface: `formato()`, `extensao()`, `descricao()`, `lerLinhas(arquivo)`) |
| ConcreteProduct | `LeitorOfx`, `LeitorCnab240`, `LeitorCnab400`                                               |
| Creator         | `ImportadorExtrato` (abstrata): chama `criarLeitor()` e implementa `importar(arquivo)`      |
| ConcreteCreator | `ImportadorOfx`, `ImportadorCnab240`, `ImportadorCnab400`                                   |
| Cliente         | `ExtratoService`: escolhe o importador pelo adaptador do tenant                             |

**Fluxo** (tela Importar extrato, tenant TransLog com CNAB240):

1. Ao abrir a tela, o frontend busca o formato do adaptador (`GET /extrato/formato/CNAB240`)
   para mostrar a extensão aceita (`.ret`) e o nome do arquivo de exemplo.
2. O usuário envia um arquivo. O frontend manda o adaptador e o nome do arquivo
   (`POST /extrato/importar`). O protótipo não lê o conteúdo enviado: o backend importa o
   arquivo de exemplo do adaptador (`AmostrasExtrato`) com o nome recebido.
3. O `ExtratoService` cria `ImportadorCnab240`. No construtor, o criador chama o método
   fábrica `criarLeitor()`, que devolve um `LeitorCnab240`.
4. `importar()` confere a extensão. Se estiver errada, responde 400 ("O adaptador CNAB240
   aceita apenas arquivos .ret").
5. O leitor converte cada registro de detalhe em `LinhaExtrato`, rejeitando valores
   ilegíveis. O criador rejeita as datas que não existem no calendário.
6. A tela mostra a prévia: linhas válidas, linhas com erro e o saldo do período.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant T as Tela Importar extrato
    participant C as ExtratoController
    participant S as ExtratoService
    participant I as ImportadorCnab240
    participant L as LeitorCnab240
    U->>T: envia RETORNO.ret
    T->>C: POST /api/extrato/importar {adaptador, nomeArquivo}
    C->>S: importar(adaptador, nomeArquivo)
    S->>I: new ImportadorCnab240()
    I->>I: criarLeitor() (método fábrica)
    I-->>L: new LeitorCnab240()
    S->>I: importar(arquivo)
    I->>I: confere a extensão .ret
    I->>L: lerLinhas(arquivo)
    L-->>I: LinhaExtrato[]
    I->>I: rejeita datas inexistentes
    I-->>S: linhas
    S-->>C: linhas
    C-->>T: {arquivo, formato, linhas}
    T-->>U: prévia: 3 válidas, 2 com erro
```

**Reuso.** Um novo banco exige só um leitor e um importador novos; aceitar o arquivo, validar
datas e montar a prévia continua escrito uma única vez em `ImportadorExtrato`.

#### Exemplo 2: plano de contas por regime tributário

**Problema.** Todo tenant parte do mesmo plano de contas base, mas cada regime tributário
acrescenta contas de tributos próprias (DAS no Simples; IRPJ/CSLL e PIS/COFINS no Presumido
e no Real). O mesmo plano aparece em duas telas: Plano de contas e Onboarding.

| Papel           | Classe                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Product         | `EnquadramentoTributario` (interface: `regime()`, `contasTributarias()`, `descricaoApuracao()`)           |
| ConcreteProduct | `EnquadramentoSimplesNacional` (1 conta), `EnquadramentoLucroPresumido` (2), `EnquadramentoLucroReal` (3) |
| Creator         | `MontadorPlanoDeContas` (abstrata): chama `criarEnquadramento()` e implementa `montar(base)`              |
| ConcreteCreator | `MontadorPlanoSimplesNacional`, `MontadorPlanoLucroPresumido`, `MontadorPlanoLucroReal`                   |
| Cliente         | `PlanoDeContasService`: lê a base no banco e escolhe o montador pelo regime                               |

**Fluxo** (tela Plano de contas, tenant Metalúrgica com Lucro Real):

1. A tela pede o plano do regime do tenant (`GET /plano-de-contas?regime=Lucro Real`).
2. O `PlanoDeContasService` lê as 20 contas base no Postgres (`ContaPlanoRepository`).
3. O service cria `MontadorPlanoLucroReal`, cujo método fábrica cria o
   `EnquadramentoLucroReal`.
4. `montar(base)` junta as contas base às 3 contas do regime e ordena por código.
5. A resposta traz o plano, a descrição da apuração e os códigos das contas do regime, que a
   tela destaca na árvore.
6. No **Onboarding**, a mesma chamada é feita para o regime escolhido; a tela mostra só as
   contas até o nível 2 e a descrição da apuração.

```mermaid
sequenceDiagram
    participant T as Tela Plano de contas
    participant C as PlanoDeContasController
    participant S as PlanoDeContasService
    participant DB as Postgres
    participant M as MontadorPlanoLucroReal
    participant E as EnquadramentoLucroReal
    T->>C: GET /api/plano-de-contas?regime=Lucro Real
    C->>S: enquadramento(regime)
    S-->>C: EnquadramentoLucroReal (regime, apuração, contas do regime)
    C->>S: plano(regime)
    S->>M: new MontadorPlanoLucroReal()
    M->>M: criarEnquadramento() (método fábrica)
    M-->>E: new EnquadramentoLucroReal()
    S->>DB: findAll() (20 contas base)
    S->>M: montar(base)
    M->>E: contasTributarias()
    E-->>M: 3 contas do regime
    M-->>S: 23 contas em ordem de código
    S-->>C: contas
    C-->>T: {regime, descricaoApuracao, contas, codigosDoRegime}
```

**Reuso.** O mesmo montador atende duas telas, e um novo regime é só mais um enquadramento e
um montador; a montagem do plano não muda.

---

### Decorator

> Um **decorador** tem a mesma interface do objeto que envolve, repassa a chamada para ele e
> acrescenta um comportamento. Decoradores podem ser empilhados em qualquer ordem e
> combinação, em tempo de execução.

#### Exemplo 1: valor devido na baixa de pagamento

**Problema.** O valor a pagar de um título pode receber juros/multa e desconto, em qualquer
combinação, e a tela precisa mostrar como o total foi composto.

| Papel             | Classe                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Component         | `ValorAPagar` (interface: `valor()`, `composicao()`)                            |
| ConcreteComponent | `ValorOriginal`: o valor do título, sem ajustes                                 |
| Decorator         | `AjusteDeValor` (abstrata): guarda o componente envolvido e repassa as chamadas |
| ConcreteDecorator | `AcrescimoJurosMulta`, `AbatimentoDesconto`                                     |
| Cliente           | `BaixaService`: envolve o valor com um decorador por ajuste informado           |

**Fluxo** (tela Baixa de pagamento, título NF-20491 de R$ 14.502,33):

1. Sempre que o usuário muda o título, os juros ou o desconto, a tela pede o valor devido
   (`POST /baixa/valor-devido`).
2. O `BaixaService` cria `ValorOriginal(título)`.
3. Se há juros (`BaixaTitulo.temJuros()`), envolve com `AcrescimoJurosMulta`; se há desconto
   (`temDesconto()`), envolve de novo com `AbatimentoDesconto`.
4. `valor()` e `composicao()` percorrem as camadas de fora para dentro, e cada camada soma ou
   subtrai o seu ajuste e acrescenta a sua linha à composição.
5. A tela mostra a composição e o total (R$ 14.502,33 + R$ 435,07 − R$ 100,00 =
   R$ 14.837,40). A baixa só pode ser confirmada com o total atualizado.

```mermaid
sequenceDiagram
    participant T as Tela Baixa
    participant C as BaixaController
    participant S as BaixaService
    participant D as AbatimentoDesconto
    participant J as AcrescimoJurosMulta
    participant O as ValorOriginal
    T->>C: POST /api/baixa/valor-devido {documento, valor, juros, desconto}
    C->>S: valorDevido(titulo, baixa)
    S->>S: valor = new ValorOriginal(titulo)
    S->>S: valor = new AcrescimoJurosMulta(valor, juros)
    S->>S: valor = new AbatimentoDesconto(valor, desconto)
    S-->>C: valor (ValorAPagar)
    C->>D: valor()
    D->>J: super.valor()
    J->>O: super.valor()
    O-->>J: 14.502,33
    J-->>D: 14.502,33 + 435,07
    D-->>C: 14.937,40 − 100,00 = 14.837,40
    C-->>T: {total, composicao}
```

**Reuso.** Cada ajuste é uma classe pequena e independente; um novo tipo de ajuste (por
exemplo, correção monetária) entra sem mexer nos existentes.

#### Exemplo 2: validação do título conforme as features

**Problema.** Todo título passa pelas regras do núcleo (documento, fornecedor, vencimento e
valor). Tenants com `centro_custo` também exigem rateio de 100%, e tenants com `alcada`
recebem um aviso quando o valor passa do limite do operador. As regras extras dependem do
que cada tenant contratou.

| Papel             | Classe                                                                       |
| ----------------- | ---------------------------------------------------------------------------- |
| Component         | `ValidadorTitulo` (interface: `validar(titulo)`)                             |
| ConcreteComponent | `ValidacaoCamposObrigatorios`: regras do núcleo                              |
| Decorator         | `ValidacaoDecorator` (abstrata): repassa ao validador envolvido              |
| ConcreteDecorator | `ValidacaoRateio` (feature `centro_custo`), `AvisoAlcada` (feature `alcada`) |
| Apoio             | `ResultadoValidacao`: erros por campo, avisos e `podeSalvar()`               |
| Cliente           | `ValidacaoService`: empilha os decoradores conforme as features              |

**Fluxo** (formulário de Contas a pagar, tenant TransLog):

1. A cada alteração do formulário, a tela envia o título e as features do tenant
   (`POST /titulos/validar`).
2. O `ValidacaoService` cria `ValidacaoCamposObrigatorios`. Se
   `ConfiguracaoTenant.possui("centro_custo")`, envolve com `ValidacaoRateio`; se possui
   `alcada` e há alçadas no banco, envolve com `AvisoAlcada`, usando a primeira (R$ 10.000,00).
3. Cada camada chama a de dentro e acrescenta o seu erro ou aviso ao mesmo
   `ResultadoValidacao`.
4. A tela mostra os erros e avisos e só habilita "Lançar título" quando `podeSalvar` é
   verdadeiro para o texto atual do formulário.
5. A tela **Rateio** reusa o mesmo endpoint mandando só `centro_custo`, e considera apenas os
   erros do campo `rateio`.

```mermaid
sequenceDiagram
    participant T as Formulário de título
    participant C as ValidacaoController
    participant S as ValidacaoService
    participant A as AvisoAlcada
    participant R as ValidacaoRateio
    participant N as ValidacaoCamposObrigatorios
    T->>C: POST /api/titulos/validar {titulo, features}
    C->>S: validar(titulo, features)
    S->>S: monta a pilha conforme as features
    S->>A: validar(titulo)
    A->>R: super.validar(titulo)
    R->>N: super.validar(titulo)
    N-->>R: resultado (erros do núcleo)
    R-->>A: + erro se o rateio não soma 100%
    A-->>S: + aviso se o valor passa da alçada
    S-->>C: resultado
    C-->>T: {erros, avisos, podeSalvar}
```

| Features ligadas   | Pilha montada            | Exemplo com R$ 12.000 e rateio 70% + 20% |
| ------------------ | ------------------------ | ---------------------------------------- |
| nenhuma (Padaria)  | núcleo                   | pode salvar                              |
| só `centro_custo`  | núcleo → rateio          | erro de rateio                           |
| só `alcada`        | núcleo → alçada          | aviso de alçada, pode salvar             |
| as duas (TransLog) | núcleo → rateio → alçada | erro de rateio + aviso de alçada         |

**Reuso.** A mesma `ValidacaoRateio` serve ao formulário de títulos e à tela de rateio, e uma
nova feature com regra própria é só mais um decorador.

---

### Chain of Responsibility

> Um pedido percorre uma **corrente de tratadores**. Cada elo decide se assume o pedido; se
> não assume, repassa ao próximo. Quem envia o pedido não sabe qual elo vai tratá-lo.

#### Exemplo 1: aprovação escalonada por alçada

**Problema.** Um título deve ser decidido pelo primeiro nível da escada que tenha limite
para o valor. Acima de todos os níveis, quem decide é o comitê. Se quem lançou é o próprio
responsável pelo nível, o título entra direto, sem fila.

| Papel           | Classe                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Handler         | `AprovadorDeTitulo` (abstrata): `encadear(proximo)`, `analisar(pedido)`, e os abstratos `assume()` e `decidir()` |
| ConcreteHandler | `AprovadorPorAlcada` (um por nível da escada), `ComiteFinanceiro` (elo final)                                    |
| Request         | `PedidoAprovacao` (documento, valor, solicitante)                                                                |
| Resposta        | `DecisaoAprovacao` (nível, responsável, exigeFila, motivo)                                                       |
| Cliente         | `AprovacaoService`: monta a corrente com as alçadas do banco                                                     |

Escada (tabela `alcada`):

| Nível               | Titular                              | Limite        |
| ------------------- | ------------------------------------ | ------------- |
| Operador financeiro | Marina Duarte                        | R$ 10.000,00  |
| Analista financeiro | Renata Oliveira                      | R$ 25.000,00  |
| Coordenador         | Roberto Tanaka                       | R$ 80.000,00  |
| Diretor financeiro  | Carlos Eduardo Menezes               | R$ 500.000,00 |
| Comitê financeiro   | Carlos Eduardo Menezes + Paula Nunes | acima de tudo |

**Fluxo** (Marina lança um título de R$ 42.980,90 na TransLog):

1. Ao clicar em "Lançar título", a tela envia o pedido (`POST /aprovacoes/responsaveis`).
2. O `AprovacaoService` lê as alçadas em ordem de limite e encadeia um `AprovadorPorAlcada`
   por nível, com o `ComiteFinanceiro` no fim.
3. O pedido entra no primeiro elo. Operador (10 mil) e Analista (25 mil) não assumem e
   repassam. O Coordenador (80 mil) assume.
4. Como quem lançou (Marina) não é o titular (Roberto), a decisão exige fila, com o motivo
   "acima da alçada de quem lançou — encaminhado a Roberto Tanaka".
5. O título entra como "Aprovação pendente", a auditoria grava o motivo, e o aviso ao
   responsável segue pela corrente de notificação (exemplo 2).
6. A **Fila de aprovação** envia todos os pendentes numa chamada só e mostra, em cada card,
   quem decide e por quê.

```mermaid
sequenceDiagram
    participant T as Contas a pagar
    participant C as AprovacaoController
    participant S as AprovacaoService
    participant Op as Operador (10 mil)
    participant An as Analista (25 mil)
    participant Co as Coordenador (80 mil)
    participant Cm as Comitê
    T->>C: POST /api/aprovacoes/responsaveis [{documento, 42980.90, Marina}]
    C->>S: responsaveis(pedidos)
    S->>S: monta a corrente com as alçadas do banco
    S->>Op: analisar(pedido)
    Op->>An: não assume, repassa
    An->>Co: não assume, repassa
    Co-->>S: assume: Roberto Tanaka, exigeFila=true
    Note over Cm: não é consultado
    S-->>C: decisões
    C-->>T: [{nivel, responsavel, exigeFila, motivo}]
```

| Valor lançado pela Marina    | Quem decide                 | Fila? |
| ---------------------------- | --------------------------- | ----- |
| até R$ 10.000,00             | Operador (a própria Marina) | não   |
| R$ 10.000,01 a R$ 25.000,00  | Analista (Renata)           | sim   |
| R$ 25.000,01 a R$ 80.000,00  | Coordenador (Roberto)       | sim   |
| R$ 80.000,01 a R$ 500.000,00 | Diretor (Carlos Eduardo)    | sim   |
| acima de R$ 500.000,00       | Comitê (2 assinaturas)      | sim   |

Sem a feature `alcada` (Padaria), a corrente não é consultada e o título entra em aberto.

**Reuso.** A escada vem do banco: um novo nível é uma linha a mais na tabela, sem mudar
código. Os mesmos elos atendem o lançamento e a fila de aprovação.

#### Exemplo 2: canal de envio da notificação

**Problema.** Avisos (título aguardando aprovação, título devolvido, teste) devem sair pelo
melhor canal disponível no tenant: Push quando o tenant contrata `notificacoes_push`, e-mail
como garantia de entrega.

| Papel           | Classe                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Handler         | `CanalNotificacao` (abstrata): `encadear(proximo)`, `enviar(notificacao)`, e os abstratos `nome()`, `disponivel()` e `formatar()` |
| ConcreteHandler | `CanalPush` (só com `notificacoes_push`; corta a mensagem em 120 caracteres), `CanalEmail` (elo final; sempre entrega)            |
| Request         | `Notificacao` (destinatário, mensagem, evento)                                                                                    |
| Resposta        | `EnvioNotificacao` (canal, destinatário, mensagem formatada, hora)                                                                |
| Cliente         | `NotificacaoService`: monta Push → E-mail                                                                                         |

**Fluxo** (título enviado para aprovação na TransLog):

1. Depois de lançar um título que exige fila, a tela envia o aviso ao responsável, com as
   features do tenant (`POST /notificacoes/enviar`). O mesmo acontece ao devolver um título
   e no botão "Enviar notificação de teste" da tela Notificações.
2. O `NotificacaoService` encadeia `CanalPush` → `CanalEmail`.
3. `CanalPush` verifica `ConfiguracaoTenant.possui("notificacoes_push")`. Na TransLog está
   disponível, então entrega e encerra a corrente.
4. Na Padaria, sem a feature, o Push repassa e o `CanalEmail` entrega, prefixando
   `[FinCore · evento]`.
5. A tela mostra por qual canal o aviso saiu.

```mermaid
sequenceDiagram
    participant T as Tela
    participant C as NotificacaoController
    participant S as NotificacaoService
    participant P as CanalPush
    participant E as CanalEmail
    T->>C: POST /api/notificacoes/enviar {features, destinatario, mensagem, evento}
    C->>S: enviar(features, notificacao)
    S->>P: enviar(notificacao)
    alt tenant contrata notificacoes_push
        P-->>S: entrega via Push (mensagem até 120 caracteres)
    else sem a feature
        P->>E: repassa
        E-->>S: entrega via E-mail "[FinCore · evento] ..."
    end
    S-->>C: envio
    C-->>T: {canal, destinatario, mensagem, hora}
```

**Reuso.** Um novo canal (por exemplo, SMS) é um elo a mais na corrente; quem envia o aviso
não muda.

## Cadastros (item 02)

Dez telas de CRUD gravam no Postgres pelo mesmo mecanismo genérico:

- **Backend:** `CrudController<T>` (`backend/.../controller/`) implementa listar (`GET`), criar
  (`POST`), editar (`PUT /{id}`) e excluir (`DELETE /{id}`) sobre um repositório Spring Data JPA,
  sem service (CRUD sem regra de negócio). Cada cadastro é uma entidade (`domain/`), um
  repositório JPA sem código próprio (`repository/`) e um controller que só declara a rota
  (`controller/`). A exceção é o `AlcadaRepository`, que acrescenta a busca ordenada por limite.
- **Frontend:** `useCadastro(recurso)` (`frontend/src/lib/use-cadastro.ts`) lista e grava pela
  API; `FormularioCadastro` e `TelaCadastro` montam o formulário e a tela a partir de uma lista
  de campos.

| Integrante | Cadastro                | Tela                  | Recurso da API            | Tabela                                                          |
| ---------- | ----------------------- | --------------------- | ------------------------- | --------------------------------------------------------------- |
| 1          | Clientes e fornecedores | `/parceiros`          | `/api/parceiros`          | `parceiro` (+ `parceiro_historico`)                             |
| 1          | Usuários                | `/usuarios`           | `/api/usuarios`           | `usuario`                                                       |
| 2          | Contas a pagar          | `/contas-a-pagar`     | `/api/contas-pagar`       | `conta_pagar` (+ `conta_pagar_rateio`, `conta_pagar_historico`) |
| 2          | Formas de pagamento     | `/formas-pagamento`   | `/api/formas-pagamento`   | `forma_pagamento`                                               |
| 3          | Contas a receber        | `/contas-a-receber`   | `/api/contas-receber`     | `conta_receber`                                                 |
| 3          | Contas bancárias        | `/contas-bancarias`   | `/api/contas-bancarias`   | `conta_bancaria`                                                |
| 4          | Centros de custo        | `/centros-de-custo`   | `/api/centros-custo`      | `centro_custo`                                                  |
| 4          | Categorias de despesa   | `/categorias-despesa` | `/api/categorias-despesa` | `categoria_despesa`                                             |
| 5          | Plano de contas         | `/plano-de-contas`    | `/api/contas-plano`       | `conta_plano`                                                   |
| 5          | Alçadas                 | `/alcadas`            | `/api/alcadas`            | `alcada`                                                        |

Os cadastros alimentam o resto do sistema: categorias no lançamento de títulos, contas
bancárias e formas de pagamento na baixa, usuários como responsáveis e titulares, centros de
custo nos rateios. A tabela `alcada` é a mesma que a corrente de aprovação lê: **editar ou criar
um nível em /alcadas muda na hora quem decide cada título**.

Os dados iniciais vêm do `backend/src/main/resources/data.sql` e são recarregados a cada subida
do backend (o Postgres roda sem volume).

## Empacotamento (item 03)

O backend é empacotado pelo Maven como o artefato **`com.fincore:backend:1.0.0`**, licença MIT
(arquivo `LICENSE` na raiz). Um comando gera e instala tudo:

```bash
cd backend
mvn install
```

1. compila as classes;
2. roda os 17 testes (se algum falha, para aqui);
3. gera os dois JARs em `target/`;
4. instala os JARs e o `pom.xml` no repositório Maven local
   (`~/.m2/repository/com/fincore/backend/1.0.0/`).

| Arquivo                  | Para que serve                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `backend-1.0.0.jar`      | **reuso**: outro projeto declara a dependência abaixo e usa as classes dos padrões e do domínio |
| `backend-1.0.0-exec.jar` | **execução**: roda a API inteira com `java -jar target/backend-1.0.0-exec.jar` (Postgres no ar) |

O que o empacotamento formaliza:

| Item           | Onde                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrato (API) | os tipos abstratos dos padrões: `ImportadorExtrato`, `MontadorPlanoDeContas`, `ValorAPagar`, `ValidadorTitulo`, `AprovadorDeTitulo` e `CanalNotificacao` |
| Metadados      | `backend/pom.xml` (grupo, nome, descrição, versão 1.0.0, licença) e `MANIFEST.MF` com título e versão                                                    |
| Dependências   | declaradas no `pom.xml` instalado: Spring Web MVC, Spring Data JPA e o driver do Postgres vêm junto para quem usar o JAR                                 |

Exemplo de uso em outro projeto Maven:

```xml
<dependency>
    <groupId>com.fincore</groupId>
    <artifactId>backend</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
ValorAPagar valor = new AbatimentoDesconto(
        new AcrescimoJurosMulta(new ValorOriginal(new TituloPagar("NF-20491", 14502.33)), 435.07), 100);
valor.valor();   // 14837.4
```

Limitação: o JAR é da aplicação inteira, não de um componente isolado. Quem o reutiliza leva
junto o Spring, o JPA, o driver do Postgres, os cadastros, o `application.properties` e o
`data.sql`.

## Testes

`mvn test` (pasta `backend/`) roda 17 testes JUnit: 12 dos padrões (sem Spring e sem banco) e 5 de
integração dos cadastros (`CadastroTest`, com MockMvc e banco H2 em memória):

| Classe                      | O que verifica                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FactoryMethodTest`         | o importador OFX cria o leitor OFX; os 3 formatos leem os mesmos lançamentos; linhas com valor ilegível e data inexistente são rejeitadas; extensão errada é recusada; o Lucro Real acrescenta 3 contas em ordem de código                         |
| `DecoratorTest`             | juros e desconto envolvem o valor original com a composição certa; rateio incompleto gera erro e valor acima da alçada gera aviso; sem decoradores só atuam as regras do núcleo                                                                    |
| `ChainOfResponsibilityTest` | valor no limite fica com o próprio operador; acima dele sobe para o analista; acima de tudo vai ao comitê; Push com a feature e e-mail sem ela; o push corta mensagens longas                                                                      |
| `CadastroTest`              | ciclo completo do CRUD genérico (formas de pagamento); título a pagar volta do banco com rateio, baixa e histórico; a baixa gravada pela API volta do banco; um nível de alçada novo muda quem decide; sem alçadas, o comitê decide e não há aviso |

## Roteiro de demonstração

Com backend e frontend no ar:

1. **Factory Method 1:** escolha a TransLog e abra Importar extrato. Use o arquivo de
   exemplo (CNAB240: 3 linhas válidas, 2 com erro). Troque para a Metalúrgica (CNAB400) ou a
   Clínica (OFX) e repita: mesmo fluxo, leitor diferente. Envie um arquivo com a extensão
   errada para ver a recusa.
2. **Factory Method 2:** abra Plano de contas na Padaria, na TransLog e na Metalúrgica (21, 22
   e 23 contas, com as do regime destacadas). No Onboarding, troque o regime no passo 1 e veja
   o passo 2 mudar.
3. **Decorator 1:** em Contas a pagar, abra a baixa do NF-20491 e informe juros e desconto; a
   caixa "Total calculado" mostra uma linha por decorador.
4. **Decorator 2:** na TransLog, crie uma conta de R$ 12.000 com rateio de 70% + 20% (erro de
   rateio e aviso de alçada). Em Features do tenant, desligue `alcada` ou `centro_custo` e repita
   para ver a pilha mudar.
5. **Chain of Responsibility 1:** na TransLog, lance contas de R$ 5.000, R$ 42.980,90 e
   R$ 600.000 e abra a Fila de aprovação para ver quem decide cada uma.
6. **Chain of Responsibility 2:** em Notificações, clique em "Enviar notificação de teste" na
   TransLog (Push) e na Padaria (E-mail), ou desligue `notificacoes_push` na TransLog.

Detalhes do frontend (rotas, perfis de acesso e variabilidade por tenant) estão em
[frontend/README.md](frontend/README.md); o backend tem um resumo próprio em
[backend/README.md](backend/README.md).
