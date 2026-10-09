# Design Patterns no FinCore

Este documento descreve os três padrões de projeto do GoF aplicados no backend do FinCore,
com dois exemplos cada. Para cada exemplo: **o problema** que existia no sistema, **como o
padrão resolve** e **o que se ganha** com isso.

| Padrão                  | Categoria     | Exemplos                                       | Pacotes                                    |
| ----------------------- | ------------- | ---------------------------------------------- | ------------------------------------------ |
| Factory Method          | Criação       | Leitor de extrato · Plano de contas por regime | `pattern/extrato`, `pattern/planodecontas` |
| Decorator               | Estrutura     | Valor da baixa · Validação do título           | `pattern/baixa`, `pattern/validacao`       |
| Chain of Responsibility | Comportamento | Aprovação por alçada · Canal de notificação    | `pattern/aprovacao`, `pattern/notificacao` |

O código fica em `backend/src/main/java/com/fincore/`, com as classes dos padrões em
`pattern/`. Em todos os exemplos, o **service** do fluxo é o cliente do padrão: monta os
objetos com `new` e devolve o resultado ao controller, que responde ao frontend. Os fluxos
completos, com diagramas de sequência, estão no [README](README.md).

---

## 1. Factory Method

### O padrão

**Problema geral.** Um processo tem passos fixos, mas um dos objetos que ele usa muda conforme
o contexto. Se o próprio processo decide qual objeto criar (com `if` ou `switch`), ele fica
preso a todas as variações e precisa ser alterado a cada variação nova.

**Solução.** Uma classe **criadora** (Creator) implementa o processo e declara um **método
fábrica** abstrato que devolve o objeto (Product). Cada **subclasse criadora**
(ConcreteCreator) implementa o método fábrica e decide qual **produto concreto**
(ConcreteProduct) criar. O processo só conhece a interface do produto.

### Exemplo 1: leitor de extrato por adaptador bancário

**Problema.** Cada banco entrega o extrato num formato diferente: OFX (marcações),
CNAB 240 e CNAB 400 (registros de posição fixa). Mas o processo de importação é o mesmo para
todos:

1. aceitar só a extensão do adaptador do tenant;
2. ler as linhas do arquivo;
3. rejeitar datas que não existem no calendário;
4. devolver a prévia com linhas válidas e com erro.

Sem o padrão, esse processo teria um `switch` de formato no meio de cada passo. Cada banco
novo obrigaria a mexer no processo inteiro e arriscaria quebrar os formatos que já
funcionam.

**Como o padrão resolve.**

| Papel           | Classe                                                    |
| --------------- | --------------------------------------------------------- |
| Product         | `LeitorExtrato` (interface)                               |
| ConcreteProduct | `LeitorOfx`, `LeitorCnab240`, `LeitorCnab400`             |
| Creator         | `ImportadorExtrato` (abstrata)                            |
| ConcreteCreator | `ImportadorOfx`, `ImportadorCnab240`, `ImportadorCnab400` |

O processo de importação é escrito uma única vez no criador, que pede o leitor ao método
fábrica:

```java
public abstract class ImportadorExtrato {
    private final LeitorExtrato leitor;

    protected ImportadorExtrato() {
        this.leitor = criarLeitor();
    }

    /** Factory Method: a subclasse decide qual leitor (produto concreto) criar. */
    protected abstract LeitorExtrato criarLeitor();

    public List<LinhaExtrato> importar(ArquivoExtrato arquivo) {
        // confere a extensão, lê com o leitor e rejeita datas inexistentes
    }
}
```

Cada criador concreto só responde à pergunta "qual leitor?":

```java
public class ImportadorCnab240 extends ImportadorExtrato {
    @Override
    protected LeitorExtrato criarLeitor() {
        return new LeitorCnab240();
    }
}
```

O `ExtratoService` escolhe o criador pelo adaptador do tenant e chama `importar()`, sem
saber qual leitor está por trás.

**Ganho.**

- O processo de importação fica num lugar só e vale para todos os formatos.
- Cada leitor só sabe converter o seu layout e não precisa conhecer o resto.
- Um banco novo é um leitor e um importador novos, sem mexer nos existentes.

### Exemplo 2: plano de contas por regime tributário

**Problema.** Todo tenant parte do mesmo plano de contas base (20 contas, guardadas no
Postgres), mas cada regime tributário acrescenta as suas contas de tributos:

- **Simples Nacional:** a DAS;
- **Lucro Presumido:** IRPJ/CSLL presumidos e PIS/COFINS cumulativo;
- **Lucro Real:** IRPJ/CSLL, PIS/COFINS não cumulativo e créditos a recuperar.

O plano montado aparece em duas telas (Plano de contas e Onboarding). Sem o padrão, as duas
telas repetiriam a lógica de "qual regime → quais contas", e um regime novo exigiria
alterar as duas.

**Como o padrão resolve.**

| Papel           | Classe                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| Product         | `EnquadramentoTributario` (interface: `contasTributarias()`, `descricaoApuracao()`)     |
| ConcreteProduct | `EnquadramentoSimplesNacional`, `EnquadramentoLucroPresumido`, `EnquadramentoLucroReal` |
| Creator         | `MontadorPlanoDeContas` (abstrata): `montar(base)`                                      |
| ConcreteCreator | `MontadorPlanoSimplesNacional`, `MontadorPlanoLucroPresumido`, `MontadorPlanoLucroReal` |

O criador monta o plano sempre do mesmo jeito: junta a base às contas do enquadramento e
ordena por código. O enquadramento vem do método fábrica `criarEnquadramento()`, que cada
montador concreto implementa. O `PlanoDeContasService` lê a base no banco, escolhe o
montador pelo regime e devolve o plano às duas telas.

**Ganho.**

- O conhecimento tributário de cada regime fica numa classe só.
- A montagem do plano é a mesma para todos os regimes e serve às duas telas.
- Um regime novo é um enquadramento e um montador novos.

---

## 2. Decorator

### O padrão

**Problema geral.** Um objeto precisa ganhar comportamentos extras que podem ou não estar
presentes, em qualquer combinação. Criar uma subclasse para cada combinação multiplica as
classes, e encher o objeto de `if` mistura todas as regras num lugar só.

**Solução.** Um **decorador** (Decorator) implementa a mesma interface do objeto
(Component), guarda uma referência ao objeto que envolve e repassa as chamadas para ele,
acrescentando o seu próprio comportamento antes ou depois. Os decoradores podem ser
empilhados em tempo de execução, em qualquer combinação.

### Exemplo 1: valor devido na baixa de pagamento

**Problema.** Ao dar baixa num título, o valor original pode receber juros/multa, desconto,
os dois ou nenhum. A tela precisa mostrar o total e **como ele foi composto**, uma linha por
ajuste. Sem o padrão, uma única função calcularia todas as combinações com `if`, e cada novo
tipo de ajuste (por exemplo, correção monetária) entraria no meio dela.

**Como o padrão resolve.**

| Papel             | Classe                                                    |
| ----------------- | --------------------------------------------------------- |
| Component         | `ValorAPagar` (interface: `valor()`, `composicao()`)      |
| ConcreteComponent | `ValorOriginal`                                           |
| Decorator         | `AjusteDeValor` (abstrata: guarda o componente e repassa) |
| ConcreteDecorator | `AcrescimoJurosMulta`, `AbatimentoDesconto`               |

O `BaixaService` envolve o valor original com uma camada por ajuste informado:

```java
ValorAPagar valor = new ValorOriginal(titulo);
if (baixa.temJuros()) {
    valor = new AcrescimoJurosMulta(valor, baixa.getJuros());
}
if (baixa.temDesconto()) {
    valor = new AbatimentoDesconto(valor, baixa.getDesconto());
}
return valor;
```

Cada decorador chama a camada de dentro (`super.valor()`), aplica o seu ajuste e acrescenta
a sua linha à composição. Para o controller, o resultado continua sendo um `ValorAPagar`,
com uma camada ou com várias.

**Ganho.**

- Cada ajuste é uma classe pequena e independente.
- Os ajustes se combinam livremente, sem uma classe para cada combinação.
- A composição exibida na tela sai naturalmente das camadas.
- Um tipo novo de ajuste é um decorador novo.

### Exemplo 2: validação do título conforme as features do tenant

**Problema.** Todo título passa pelas regras do núcleo: documento, fornecedor, vencimento e
valor maior que zero. Alguns tenants contrataram features que trazem regras extras:

- `centro_custo`: o rateio precisa somar exatamente 100%;
- `alcada`: um aviso quando o valor passa do limite do operador.

Cada tenant tem uma combinação diferente. Sem o padrão, o validador teria um `if` por
feature misturado às regras do núcleo, e a tela de Rateio, que só precisa da regra de 100%,
não conseguiria reaproveitar essa regra isoladamente.

**Como o padrão resolve.**

| Papel             | Classe                                           |
| ----------------- | ------------------------------------------------ |
| Component         | `ValidadorTitulo` (interface: `validar(titulo)`) |
| ConcreteComponent | `ValidacaoCamposObrigatorios` (regras do núcleo) |
| Decorator         | `ValidacaoDecorator` (abstrata)                  |
| ConcreteDecorator | `ValidacaoRateio`, `AvisoAlcada`                 |

O `ValidacaoService` monta a pilha de acordo com as features contratadas pelo tenant:

```java
ValidadorTitulo validador = new ValidacaoCamposObrigatorios();
if (tenant.possui("centro_custo")) {
    validador = new ValidacaoRateio(validador);
}
List<Alcada> escada = alcadas.findAllByOrderByLimiteAsc();
if (tenant.possui("alcada") && !escada.isEmpty()) {
    validador = new AvisoAlcada(validador, escada.getFirst());
}
return validador.validar(titulo);
```

Cada camada chama a de dentro e acrescenta o seu erro ou aviso ao mesmo
`ResultadoValidacao`. Ligar ou desligar uma feature em Features do tenant muda a pilha na
próxima validação, sem mudar código.

**Ganho.**

- As regras do núcleo ficam separadas das regras de cada feature.
- A mesma `ValidacaoRateio` atende o formulário de títulos e a tela de Rateio.
- Uma feature nova com regra própria é um decorador novo.

---

## 3. Chain of Responsibility

### O padrão

**Problema geral.** Um pedido pode ser tratado por vários objetos, mas só um deve tratá-lo,
e qual será depende do pedido. Se quem envia precisa saber quem trata cada caso, fica
acoplado a todos os tratadores e às regras de escolha.

**Solução.** Os tratadores (Handlers) formam uma **corrente**. Cada um decide se assume o
pedido: se sim, trata e encerra; se não, repassa ao próximo. Quem envia entrega o pedido
ao primeiro elo e não sabe qual elo vai responder.

### Exemplo 1: aprovação escalonada por alçada

**Problema.** Um título a pagar precisa ser decidido pelo **primeiro nível** da escada de
alçadas com limite suficiente:

| Nível               | Titular                | Limite        |
| ------------------- | ---------------------- | ------------- |
| Operador financeiro | Marina Duarte          | R$ 10.000,00  |
| Analista financeiro | Renata Oliveira        | R$ 25.000,00  |
| Coordenador         | Roberto Tanaka         | R$ 80.000,00  |
| Diretor financeiro  | Carlos Eduardo Menezes | R$ 500.000,00 |

Acima de todos os níveis, quem decide é o **comitê** (duas assinaturas). Se quem lançou é o
próprio titular do nível, o título entra direto, sem fila. Sem o padrão, uma cadeia de
`if/else` com os limites ficaria escrita no código, repetida no lançamento e na fila de
aprovação, e mudar a escada exigiria mudar o código.

**Como o padrão resolve.**

| Papel           | Classe                                                                              |
| --------------- | ----------------------------------------------------------------------------------- |
| Handler         | `AprovadorDeTitulo` (abstrata: `encadear()`, `analisar()`, `assume()`, `decidir()`) |
| ConcreteHandler | `AprovadorPorAlcada` (um por nível), `ComiteFinanceiro` (elo final)                 |
| Request         | `PedidoAprovacao` (documento, valor, solicitante)                                   |

O handler base percorre a corrente; cada elo só responde se assume o pedido e qual é a
decisão:

```java
public DecisaoAprovacao analisar(PedidoAprovacao pedido) {
    if (assume(pedido)) {
        return decidir(pedido);
    }
    return proximo == null ? null : proximo.analisar(pedido);
}
```

O `AprovacaoService` monta a corrente com as alçadas lidas do banco, em ordem de limite, e
põe o comitê no fim:

```java
List<AprovadorDeTitulo> elos = new ArrayList<>();
for (Alcada alcada : alcadas.findAllByOrderByLimiteAsc()) {
    elos.add(new AprovadorPorAlcada(alcada));
}
elos.add(new ComiteFinanceiro(List.of("Carlos Eduardo Menezes", "Paula Nunes")));
for (int i = 0; i < elos.size() - 1; i++) {
    elos.get(i).encadear(elos.get(i + 1));
}
return elos.getFirst();
```

Um título de R$ 42.980,90 lançado pela Marina passa pelo Operador e pelo Analista, que não
assumem, e é assumido pelo Coordenador. A decisão volta com o responsável, se exige fila e o
motivo.

**Ganho.**

- Quem lança o título não conhece a escada.
- Cada nível só sabe o seu limite.
- A escada vem do banco: um nível novo é uma linha na tabela `alcada`, sem mudar código.
- Os mesmos elos atendem o lançamento e a fila de aprovação.

### Exemplo 2: canal de envio da notificação

**Problema.** Os avisos (título aguardando aprovação, título devolvido, teste) devem sair
pelo **melhor canal disponível** no tenant:

- **Push**, se o tenant contrata `notificacoes_push`, com a mensagem cortada em
  120 caracteres;
- **e-mail**, como garantia de entrega, com o prefixo `[FinCore · evento]`.

Sem o padrão, cada tela que envia um aviso teria de perguntar quais features o tenant tem e
formatar a mensagem para cada canal.

**Como o padrão resolve.**

| Papel           | Classe                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| Handler         | `CanalNotificacao` (abstrata: `encadear()`, `enviar()`, `disponivel()`, `formatar()`) |
| ConcreteHandler | `CanalPush`, `CanalEmail` (elo final)                                                 |
| Request         | `Notificacao` (destinatário, mensagem, evento)                                        |

O `NotificacaoService` encadeia Push → E-mail. O `CanalPush` verifica se o tenant possui
`notificacoes_push`: se sim, entrega e encerra; se não, repassa. O `CanalEmail` está sempre
disponível e garante a entrega. A resposta informa por qual canal o aviso saiu.

**Ganho.**

- Quem envia o aviso não sabe nada sobre canais nem features.
- Cada canal concentra a sua regra de disponibilidade e o seu formato.
- Um canal novo (por exemplo, SMS) é um elo a mais na corrente.

---

## Resumo

| Padrão                  | Problema que resolve                                 | Como resolve                                                              | Onde se vê no sistema                                 |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| Factory Method          | Processo fixo que depende de um objeto que varia     | O criador implementa o processo; as subclasses decidem qual produto criar | Importar extrato; Plano de contas e Onboarding        |
| Decorator               | Comportamentos opcionais em qualquer combinação      | Camadas com a mesma interface, que repassam e acrescentam                 | Baixa de pagamento; formulário de títulos e Rateio    |
| Chain of Responsibility | Escolher quem trata um pedido sem acoplar quem envia | Corrente de tratadores; o primeiro que assume, decide                     | Lançamento e fila de aprovação; avisos de notificação |

Os três padrões têm o mesmo efeito sobre o reuso: **separam o que é comum, escrito uma vez,
do que varia, uma classe por variação**. O mesmo código atende várias telas e os quatro
tenants do sistema, e cada variação nova (banco, regime, ajuste, regra, nível ou canal) entra
sem alterar o que já funciona.
