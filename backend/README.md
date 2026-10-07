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

## Classes de domínio (`com.fincore.dominio`)

ConfiguracaoTenant, TituloPagar, Rateio, LinhaRateio, BaixaTitulo, Alcada (tabela),
ContaPlano (tabela), LinhaExtrato, ArquivoExtrato, Notificacao e PedidoAprovacao.

## Cadastros (`com.fincore.cadastro`)

CRUD genérico em `CrudController<T>` (GET lista, POST cria, PUT edita, DELETE exclui). Cada um
dos 10 cadastros declara só a entidade, o repositório e a rota: `/api/parceiros`,
`/api/contas-pagar`, `/api/contas-receber`, `/api/centros-custo`, `/api/contas-plano`,
`/api/alcadas`, `/api/contas-bancarias`, `/api/categorias-despesa`, `/api/usuarios` e
`/api/formas-pagamento`. `Alcada` e `ContaPlano` são as mesmas classes de domínio usadas pelos
padrões.

## Padrões e exemplos

| Padrão                  | Exemplo                         | Pacote          | Participantes                                                                                                                                                                                                                                                                        | Endpoint                                                             | Tela                                     |
| ----------------------- | ------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------- |
| Factory Method          | Leitor de extrato por adaptador | `extrato`       | Product `LeitorExtrato`; ConcreteProduct `LeitorOfx`, `LeitorCnab240`, `LeitorCnab400`; Creator `ImportadorExtrato`; ConcreteCreator `ImportadorOfx`, `ImportadorCnab240`, `ImportadorCnab400`                                                                                       | `GET /api/extrato/formato/{adaptador}`, `POST /api/extrato/importar` | Importar extrato                         |
| Factory Method          | Plano de contas por regime      | `planodecontas` | Product `EnquadramentoTributario`; ConcreteProduct `EnquadramentoSimplesNacional`, `EnquadramentoLucroPresumido`, `EnquadramentoLucroReal`; Creator `MontadorPlanoDeContas`; ConcreteCreator `MontadorPlanoSimplesNacional`, `MontadorPlanoLucroPresumido`, `MontadorPlanoLucroReal` | `GET /api/plano-de-contas?regime=`                                   | Plano de contas, Onboarding              |
| Decorator               | Valor devido na baixa           | `baixa`         | Component `ValorAPagar`; ConcreteComponent `ValorOriginal`; Decorator `AjusteDeValor`; ConcreteDecorator `AcrescimoJurosMulta`, `AbatimentoDesconto`                                                                                                                                 | `POST /api/baixa/valor-devido`                                       | Baixa de pagamento                       |
| Decorator               | Validação do título por feature | `validacao`     | Component `ValidadorTitulo`; ConcreteComponent `ValidacaoCamposObrigatorios`; Decorator `ValidacaoDecorator`; ConcreteDecorator `ValidacaoRateio`, `AvisoAlcada`                                                                                                                     | `POST /api/titulos/validar`                                          | Contas a pagar, Rateio                   |
| Chain of Responsibility | Aprovação por alçada            | `aprovacao`     | Handler `AprovadorDeTitulo`; ConcreteHandler `AprovadorPorAlcada`, `ComiteFinanceiro`                                                                                                                                                                                                | `POST /api/aprovacoes/responsaveis`                                  | Contas a pagar, Aprovações               |
| Chain of Responsibility | Canal de notificação            | `notificacao`   | Handler `CanalNotificacao`; ConcreteHandler `CanalPush`, `CanalEmail`                                                                                                                                                                                                                | `POST /api/notificacoes/enviar`                                      | Contas a pagar, Aprovações, Notificações |

Em cada pacote, o controller é o cliente do padrão: cria os objetos com `new` e devolve o
resultado.
