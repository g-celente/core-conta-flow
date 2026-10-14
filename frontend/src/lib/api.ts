import type { ConfigTenant, Feature } from "@/components/app/FeaturesContext";
import type { ContaPlano, RateioLinha } from "@/lib/mock-data";

/**
 * Cliente da API do backend (Spring Boot, pasta backend/). As regras dos padrões de projeto
 * rodam lá, e os cadastros são gravados no banco; as telas só enviam e mostram os dados.
 */
const API = "http://localhost:8081/api";

/** GET sem corpo, POST com corpo, ou o verbo informado. Erros viram `Error` com a mensagem do backend. */
async function chamar<T>(caminho: string, corpo?: unknown, metodo?: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API}${caminho}`, {
      method: metodo ?? (corpo === undefined ? "GET" : "POST"),
      ...(corpo === undefined
        ? {}
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) }),
    });
  } catch {
    throw new Error("Backend indisponível em localhost:8081");
  }
  if (!resposta.ok) {
    const erro = (await resposta.json().catch(() => ({}))) as { mensagem?: string };
    throw new Error(erro.mensagem ?? `Erro ${resposta.status} no backend`);
  }
  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

export type FormatoExtrato = {
  formato: string;
  extensao: string;
  descricao: string;
  amostra: string;
};
export type LinhaLida = {
  linha: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: "Crédito" | "Débito";
  erro: string | null;
};
export type Importacao = { arquivo: string; formato: string; linhas: LinhaLida[] };
export type Plano = {
  regime: string;
  descricaoApuracao: string;
  contas: ContaPlano[];
  codigosDoRegime: string[];
};
export type ValorDevido = { total: number; composicao: string[] };
export type Validacao = {
  erros: { campo: string; mensagem: string }[];
  avisos: string[];
  podeSalvar: boolean;
};
export type TituloParaValidar = {
  documento: string;
  parceiroId: string;
  vencimento: string;
  valor: number;
  rateio: RateioLinha[];
};
export type PedidoAprovacao = { documento: string; valor: number; solicitante: string };
export type Decisao = { nivel: string; responsavel: string; exigeFila: boolean; motivo: string };
export type Envio = { canal: string; destinatario: string; mensagem: string; hora: string };

/** Factory Method 1: formato e arquivo de exemplo do adaptador. */
export const formatoExtrato = (adaptador: string) =>
  chamar<FormatoExtrato>(`/extrato/formato/${adaptador}`);

/** Factory Method 1: importa a amostra do adaptador com o nome do arquivo enviado. */
export const importarExtrato = (adaptador: string, nomeArquivo: string) =>
  chamar<Importacao>("/extrato/importar", { adaptador, nomeArquivo });

/** Factory Method 2: plano de contas base + contas do regime. */
export const planoDeContas = (regime: string) =>
  chamar<Plano>(`/plano-de-contas?regime=${encodeURIComponent(regime)}`);

/** Decorator 1: valor devido na baixa, com a composição de cada ajuste. */
export const valorDevido = (documento: string, valor: number, juros: number, desconto: number) =>
  chamar<ValorDevido>("/baixa/valor-devido", { documento, valor, juros, desconto });

/** Decorator 2: o formulário pode guardar o percentual como texto; a API recebe número. */
export const validarTitulo = (titulo: TituloParaValidar, features: Feature[]) =>
  chamar<Validacao>("/titulos/validar", {
    titulo: {
      ...titulo,
      rateio: titulo.rateio.map((r) => ({
        centroId: r.centroId,
        percentual: Number(r.percentual) || 0,
      })),
    },
    features,
  });

/** Chain of Responsibility 1: quem decide cada pedido, na mesma ordem. */
export const responsaveis = (pedidos: PedidoAprovacao[]) =>
  chamar<Decisao[]>("/aprovacoes/responsaveis", pedidos);

/** Chain of Responsibility 2: o aviso sai pelo primeiro canal disponível. */
export const enviarNotificacao = (
  features: Feature[],
  destinatario: string,
  mensagem: string,
  evento: string,
) => chamar<Envio>("/notificacoes/enviar", { features, destinatario, mensagem, evento });

/** Cadastros (CRUD genérico): o recurso é o final da rota, ex.: "parceiros". */
export const listar = <T>(recurso: string) => chamar<T[]>(`/${recurso}`);
export const criar = <T>(recurso: string, registro: T) => chamar<T>(`/${recurso}`, registro);
export const editar = <T extends { id: string }>(recurso: string, registro: T) =>
  chamar<T>(`/${recurso}/${registro.id}`, registro, "PUT");
export const excluir = (recurso: string, id: string) =>
  chamar<void>(`/${recurso}/${id}`, undefined, "DELETE");

/** Lista das features ligadas no tenant, no formato que a API recebe. */
export const featuresAtivas = (config: ConfigTenant): Feature[] =>
  (Object.keys(config.features) as Feature[]).filter((f) => config.features[f]);

/** Mensagens de erro de um campo, para exibir junto dele no formulário. */
export const errosDe = (validacao: Validacao, campo: string) =>
  validacao.erros.filter((e) => e.campo === campo).map((e) => e.mensagem);

/** Enquanto a primeira validação não chega, o formulário não pode ser salvo. */
export const SEM_VALIDACAO: Validacao = { erros: [], avisos: [], podeSalvar: false };
