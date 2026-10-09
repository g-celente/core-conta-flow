# FinCore — backend

API Spring Boot 4.1 (Java 21) com as classes de domínio, os 3 padrões de projeto e os 10
cadastros. O Postgres guarda os cadastros; os dados iniciais são recarregados a cada subida
(`data.sql`).

## Como rodar

```bash
docker compose up -d      # Postgres na porta 5434
mvn spring-boot:run       # API em http://localhost:8081/api
mvn test                  # testes dos padrões e dos cadastros (não precisam do Docker)
mvn install               # empacota: backend-1.0.0.jar (reuso) e backend-1.0.0-exec.jar (java -jar)
```

## Camadas (`com.fincore`)

- `controller/`: recebe a requisição HTTP, converte para objetos de domínio, chama o service e
  monta a resposta JSON. Nos cadastros, o `CrudController` usa o repositório direto.
- `service/`: um service por fluxo dos padrões; é o cliente do padrão.
- `repository/`: os 10 repositórios JPA.
- `domain/`: classes de domínio, entidades dos cadastros e `Moeda`.
- `pattern/`: as classes dos padrões, um subpacote por exemplo (`extrato`, `planodecontas`,
  `baixa`, `validacao`, `aprovacao`, `notificacao`).

## Classes de domínio (`com.fincore.domain`)

ConfiguracaoTenant, TituloPagar, Rateio, LinhaRateio, BaixaTitulo, Alcada (tabela),
ContaPlano (tabela), LinhaExtrato, ArquivoExtrato, Notificacao e PedidoAprovacao. No mesmo
pacote ficam as entidades dos cadastros e `Moeda`.

## Cadastros

CRUD genérico em `CrudController<T>` (GET lista, POST cria, PUT edita, DELETE exclui), que usa o
repositório direto, sem service. Cada um dos 10 cadastros declara só a entidade (`domain`), o
repositório (`repository`) e a rota (`controller`): `/api/parceiros`,
`/api/contas-pagar`, `/api/contas-receber`, `/api/centros-custo`, `/api/contas-plano`,
`/api/alcadas`, `/api/contas-bancarias`, `/api/categorias-despesa`, `/api/usuarios` e
`/api/formas-pagamento`. `Alcada` e `ContaPlano` são as mesmas classes de domínio usadas pelos
padrões; `LinhaRateio` e `BaixaTitulo` também são gravadas dentro de `ContaPagar`.

## Padrões e exemplos

| Padrão                  | Exemplo                         | Pacote                  | Participantes                                                                                                                                                                                                                                                                        | Endpoint                                                             | Tela                                            |
| ----------------------- | ------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------- |
| Factory Method          | Leitor de extrato por adaptador | `pattern/extrato`       | Product `LeitorExtrato`; ConcreteProduct `LeitorOfx`, `LeitorCnab240`, `LeitorCnab400`; Creator `ImportadorExtrato`; ConcreteCreator `ImportadorOfx`, `ImportadorCnab240`, `ImportadorCnab400`                                                                                       | `GET /api/extrato/formato/{adaptador}`, `POST /api/extrato/importar` | Importar extrato                                |
| Factory Method          | Plano de contas por regime      | `pattern/planodecontas` | Product `EnquadramentoTributario`; ConcreteProduct `EnquadramentoSimplesNacional`, `EnquadramentoLucroPresumido`, `EnquadramentoLucroReal`; Creator `MontadorPlanoDeContas`; ConcreteCreator `MontadorPlanoSimplesNacional`, `MontadorPlanoLucroPresumido`, `MontadorPlanoLucroReal` | `GET /api/plano-de-contas?regime=`                                   | Plano de contas, Onboarding                     |
| Decorator               | Valor devido na baixa           | `pattern/baixa`         | Component `ValorAPagar`; ConcreteComponent `ValorOriginal`; Decorator `AjusteDeValor`; ConcreteDecorator `AcrescimoJurosMulta`, `AbatimentoDesconto`                                                                                                                                 | `POST /api/baixa/valor-devido`                                       | Baixa de pagamento                              |
| Decorator               | Validação do título por feature | `pattern/validacao`     | Component `ValidadorTitulo`; ConcreteComponent `ValidacaoCamposObrigatorios`; Decorator `ValidacaoDecorator`; ConcreteDecorator `ValidacaoRateio`, `AvisoAlcada`                                                                                                                     | `POST /api/titulos/validar`                                          | Contas a pagar, Rateio                          |
| Chain of Responsibility | Aprovação por alçada            | `pattern/aprovacao`     | Handler `AprovadorDeTitulo`; ConcreteHandler `AprovadorPorAlcada`, `ComiteFinanceiro`                                                                                                                                                                                                | `POST /api/aprovacoes/responsaveis`                                  | Contas a pagar, Fila de aprovação               |
| Chain of Responsibility | Canal de notificação            | `pattern/notificacao`   | Handler `CanalNotificacao`; ConcreteHandler `CanalPush`, `CanalEmail`                                                                                                                                                                                                                | `POST /api/notificacoes/enviar`                                      | Contas a pagar, Fila de aprovação, Notificações |

Em cada fluxo, o service (`ExtratoService`, `PlanoDeContasService`, `BaixaService`,
`ValidacaoService`, `AprovacaoService`, `NotificacaoService`) é o cliente do padrão: cria os
objetos com `new` e devolve o resultado ao controller.
