import { createContext, useContext, type ReactNode } from "react";
import type { Alteracao, BaixaTitulo, Parceiro, TituloPagar } from "@/lib/mock-data";
import { useCadastro } from "@/lib/use-cadastro";

/**
 * Estado de dados do protótipo. Concentra o CRUD das duas entidades exigidas
 * (Parceiro e Título a pagar), gravadas no banco pelos cadastros `parceiros` e
 * `contas-pagar`, para que todas as telas — inclusive o módulo exclusivo de comissões —
 * leiam e escrevam a mesma fonte.
 */

const hoje = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const alteracao = (usuario: string, descricao: string): Alteracao => ({
  data: hoje(),
  usuario,
  descricao,
});

export type NovoParceiro = Omit<Parceiro, "id" | "emAberto" | "ativo" | "historico">;
export type NovoTitulo = Omit<TituloPagar, "id" | "status" | "historico" | "baixa" | "lancadoPor">;

type Ctx = {
  parceiros: Parceiro[];
  titulos: TituloPagar[];

  /** As gravações devolvem se deram certo; em caso de erro, o usuário já foi avisado. */
  criarParceiro: (p: NovoParceiro, usuario: string) => Promise<boolean>;
  editarParceiro: (id: string, p: NovoParceiro, usuario: string) => Promise<boolean>;
  inativarParceiro: (id: string, usuario: string) => Promise<boolean>;
  reativarParceiro: (id: string, usuario: string) => Promise<boolean>;
  /** Soma dos títulos em aberto do parceiro — bloqueia a inativação. */
  emAbertoDoParceiro: (id: string) => number;

  criarTitulo: (t: NovoTitulo, usuario: string, acimaDaAlcada: boolean) => Promise<boolean>;
  editarTitulo: (id: string, t: NovoTitulo, usuario: string) => Promise<boolean>;
  cancelarTitulo: (id: string, usuario: string) => Promise<boolean>;
  aprovarTitulo: (id: string, usuario: string) => Promise<boolean>;
  devolverTitulo: (id: string, usuario: string, justificativa: string) => Promise<boolean>;
  baixarTitulo: (id: string, baixa: BaixaTitulo, usuario: string) => Promise<boolean>;
  /** Interface pública consumida por módulos externos (ex.: comissões). */
  lancarTituloDeModulo: (dados: {
    documento: string;
    fornecedor: string;
    valor: number;
    vencimento: string;
    categoria: string;
    origem: string;
  }) => TituloPagar;
};

const DadosCtx = createContext<Ctx | null>(null);

export function DadosProvider({ children }: { children: ReactNode }) {
  const cadastroParceiros = useCadastro<Parceiro>("parceiros");
  const cadastroTitulos = useCadastro<TituloPagar>("contas-pagar");
  const parceiros = cadastroParceiros.registros;
  const titulos = cadastroTitulos.registros;

  /** Grava o parceiro com as mudanças aplicadas sobre a versão atual. */
  const mudarParceiro = (id: string, mudar: (p: Parceiro) => Parceiro) => {
    const atual = cadastroParceiros.buscar(id);
    return atual ? cadastroParceiros.editar(mudar(atual)) : Promise.resolve(false);
  };

  /** Grava o título com as mudanças aplicadas sobre a versão atual. */
  const mudarTitulo = (id: string, mudar: (t: TituloPagar) => TituloPagar) => {
    const atual = cadastroTitulos.buscar(id);
    return atual ? cadastroTitulos.editar(mudar(atual)) : Promise.resolve(false);
  };

  const value: Ctx = {
    parceiros,
    titulos,

    emAbertoDoParceiro: (id) =>
      titulos
        .filter((t) => t.parceiroId === id && t.status !== "Pago" && t.status !== "Cancelado")
        .reduce((s, t) => s + t.valor, 0),

    criarParceiro: (p, usuario) => {
      const novo: Parceiro = {
        ...p,
        id: crypto.randomUUID(),
        emAberto: 0,
        ativo: true,
        historico: [alteracao(usuario, "Cadastro criado")],
      };
      return cadastroParceiros.criar(novo);
    },

    editarParceiro: (id, p, usuario) =>
      mudarParceiro(id, (x) => {
        const mudancas: string[] = [];
        if (x.razaoSocial !== p.razaoSocial) mudancas.push("razão social");
        if (x.nomeFantasia !== p.nomeFantasia) mudancas.push("nome fantasia");
        if (x.tipo !== p.tipo) mudancas.push(`tipo de ${x.tipo} para ${p.tipo}`);
        if (x.email !== p.email) mudancas.push("e-mail");
        if (x.telefone !== p.telefone) mudancas.push("telefone");
        if (x.cidade !== p.cidade || x.uf !== p.uf) mudancas.push("endereço");
        const historico = mudancas.length
          ? [...x.historico, alteracao(usuario, `Alterado: ${mudancas.join(", ")}`)]
          : x.historico;
        return { ...x, ...p, historico };
      }),

    inativarParceiro: (id, usuario) =>
      mudarParceiro(id, (x) => ({
        ...x,
        ativo: false,
        historico: [...x.historico, alteracao(usuario, "Cadastro inativado")],
      })),

    reativarParceiro: (id, usuario) =>
      mudarParceiro(id, (x) => ({
        ...x,
        ativo: true,
        historico: [...x.historico, alteracao(usuario, "Inativação desfeita")],
      })),

    criarTitulo: (t, usuario, acimaDaAlcada) => {
      const novo: TituloPagar = {
        ...t,
        id: crypto.randomUUID(),
        status: acimaDaAlcada ? "Aprovação pendente" : "Em aberto",
        lancadoPor: usuario,
        historico: [
          alteracao(usuario, "Título lançado"),
          ...(acimaDaAlcada
            ? [alteracao(usuario, "Enviado à fila de aprovação (acima da alçada)")]
            : []),
        ],
      };
      return cadastroTitulos.criar(novo);
    },

    editarTitulo: (id, t, usuario) =>
      mudarTitulo(id, (x) => {
        const mudancas: string[] = [];
        if (x.valor !== t.valor) mudancas.push("valor");
        if (x.vencimento !== t.vencimento) mudancas.push("vencimento");
        if (x.categoria !== t.categoria) mudancas.push("categoria");
        if (JSON.stringify(x.rateio) !== JSON.stringify(t.rateio)) mudancas.push("rateio");
        const historico = mudancas.length
          ? [...x.historico, alteracao(usuario, `Alterado: ${mudancas.join(", ")}`)]
          : x.historico;
        return { ...x, ...t, historico };
      }),

    cancelarTitulo: (id, usuario) =>
      mudarTitulo(id, (x) => ({
        ...x,
        status: "Cancelado",
        historico: [...x.historico, alteracao(usuario, "Cancelado logicamente")],
      })),

    aprovarTitulo: (id, usuario) =>
      mudarTitulo(id, (x) => ({
        ...x,
        status: "Em aberto",
        historico: [...x.historico, alteracao(usuario, "Aprovado para pagamento")],
      })),

    devolverTitulo: (id, usuario, justificativa) =>
      mudarTitulo(id, (x) => ({
        ...x,
        status: "Cancelado",
        historico: [...x.historico, alteracao(usuario, `Devolvido: ${justificativa}`)],
      })),

    baixarTitulo: (id, baixa, usuario) =>
      mudarTitulo(id, (x) => ({
        ...x,
        status: "Pago",
        baixa,
        historico: [...x.historico, alteracao(usuario, `Baixa registrada em ${baixa.conta}`)],
      })),

    lancarTituloDeModulo: (dados) => {
      const novo: TituloPagar = {
        id: crypto.randomUUID(),
        documento: dados.documento,
        parceiroId: "",
        fornecedor: dados.fornecedor,
        categoria: dados.categoria,
        vencimento: dados.vencimento,
        valor: dados.valor,
        status: "Em aberto",
        rateio: [{ centroId: "cc-2", percentual: 100 }],
        origem: dados.origem,
        lancadoPor: "Módulo de comissões",
        historico: [alteracao("Sistema", `Gerado por ${dados.origem}`)],
      };
      void cadastroTitulos.criar(novo);
      return novo;
    },
  };

  return <DadosCtx.Provider value={value}>{children}</DadosCtx.Provider>;
}

export function useDados() {
  const ctx = useContext(DadosCtx);
  if (!ctx) throw new Error("useDados deve ser usado dentro de DadosProvider");
  return ctx;
}
