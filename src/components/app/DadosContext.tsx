import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  parceirosIniciais,
  titulosPagarIniciais,
  type Alteracao,
  type BaixaTitulo,
  type Parceiro,
  type TituloPagar,
} from "@/lib/mock-data";

/**
 * Estado de dados do protótipo. Concentra o CRUD das duas entidades exigidas
 * (Parceiro e Título a pagar) para que todas as telas — inclusive o módulo
 * exclusivo de comissões — leiam e escrevam a mesma fonte em memória.
 */

const hoje = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export type NovoParceiro = Omit<Parceiro, "id" | "emAberto" | "ativo" | "historico">;
export type NovoTitulo = Omit<TituloPagar, "id" | "status" | "historico" | "baixa" | "lancadoPor">;

type Ctx = {
  parceiros: Parceiro[];
  titulos: TituloPagar[];

  criarParceiro: (p: NovoParceiro, usuario: string) => Parceiro;
  editarParceiro: (id: string, p: NovoParceiro, usuario: string) => void;
  inativarParceiro: (id: string, usuario: string) => void;
  reativarParceiro: (id: string, usuario: string) => void;
  /** Soma dos títulos em aberto do parceiro — bloqueia a inativação. */
  emAbertoDoParceiro: (id: string) => number;

  criarTitulo: (t: NovoTitulo, usuario: string, acimaDaAlcada: boolean) => TituloPagar;
  editarTitulo: (id: string, t: NovoTitulo, usuario: string) => void;
  cancelarTitulo: (id: string, usuario: string) => void;
  aprovarTitulo: (id: string, usuario: string) => void;
  devolverTitulo: (id: string, usuario: string, justificativa: string) => void;
  baixarTitulo: (id: string, baixa: BaixaTitulo, usuario: string) => void;
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

let seqParceiro = 100;
let seqTitulo = 100;

export function DadosProvider({ children }: { children: ReactNode }) {
  const [parceiros, setParceiros] = useState<Parceiro[]>(parceirosIniciais);
  const [titulos, setTitulos] = useState<TituloPagar[]>(titulosPagarIniciais);

  const emAbertoDoParceiro = useCallback(
    (id: string) =>
      titulos
        .filter((t) => t.parceiroId === id && t.status !== "Pago" && t.status !== "Cancelado")
        .reduce((s, t) => s + t.valor, 0),
    [titulos],
  );

  const criarParceiro = useCallback((p: NovoParceiro, usuario: string) => {
    seqParceiro += 1;
    const novo: Parceiro = {
      ...p,
      id: `pa-${seqParceiro}`,
      emAberto: 0,
      ativo: true,
      historico: [{ data: hoje(), usuario, descricao: "Cadastro criado" }],
    };
    setParceiros((l) => [novo, ...l]);
    return novo;
  }, []);

  const editarParceiro = useCallback((id: string, p: NovoParceiro, usuario: string) => {
    setParceiros((l) =>
      l.map((x) => {
        if (x.id !== id) return x;
        const mudancas: string[] = [];
        if (x.razaoSocial !== p.razaoSocial) mudancas.push("razão social");
        if (x.nomeFantasia !== p.nomeFantasia) mudancas.push("nome fantasia");
        if (x.tipo !== p.tipo) mudancas.push(`tipo de ${x.tipo} para ${p.tipo}`);
        if (x.email !== p.email) mudancas.push("e-mail");
        if (x.telefone !== p.telefone) mudancas.push("telefone");
        if (x.cidade !== p.cidade || x.uf !== p.uf) mudancas.push("endereço");
        const historico: Alteracao[] = mudancas.length
          ? [
              ...x.historico,
              { data: hoje(), usuario, descricao: `Alterado: ${mudancas.join(", ")}` },
            ]
          : x.historico;
        return { ...x, ...p, historico };
      }),
    );
  }, []);

  const inativarParceiro = useCallback((id: string, usuario: string) => {
    setParceiros((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              ativo: false,
              historico: [
                ...x.historico,
                { data: hoje(), usuario, descricao: "Cadastro inativado" },
              ],
            }
          : x,
      ),
    );
  }, []);

  const reativarParceiro = useCallback((id: string, usuario: string) => {
    setParceiros((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              ativo: true,
              historico: [
                ...x.historico,
                { data: hoje(), usuario, descricao: "Inativação desfeita" },
              ],
            }
          : x,
      ),
    );
  }, []);

  const criarTitulo = useCallback((t: NovoTitulo, usuario: string, acimaDaAlcada: boolean) => {
    seqTitulo += 1;
    const novo: TituloPagar = {
      ...t,
      id: `tp-${seqTitulo}`,
      status: acimaDaAlcada ? "Aprovação pendente" : "Em aberto",
      lancadoPor: usuario,
      historico: [
        { data: hoje(), usuario, descricao: "Título lançado" },
        ...(acimaDaAlcada
          ? [{ data: hoje(), usuario, descricao: "Enviado à fila de aprovação (acima da alçada)" }]
          : []),
      ],
    };
    setTitulos((l) => [novo, ...l]);
    return novo;
  }, []);

  const editarTitulo = useCallback((id: string, t: NovoTitulo, usuario: string) => {
    setTitulos((l) =>
      l.map((x) => {
        if (x.id !== id) return x;
        const mudancas: string[] = [];
        if (x.valor !== t.valor) mudancas.push("valor");
        if (x.vencimento !== t.vencimento) mudancas.push("vencimento");
        if (x.categoria !== t.categoria) mudancas.push("categoria");
        if (JSON.stringify(x.rateio) !== JSON.stringify(t.rateio)) mudancas.push("rateio");
        const historico = mudancas.length
          ? [
              ...x.historico,
              { data: hoje(), usuario, descricao: `Alterado: ${mudancas.join(", ")}` },
            ]
          : x.historico;
        return { ...x, ...t, historico };
      }),
    );
  }, []);

  const cancelarTitulo = useCallback((id: string, usuario: string) => {
    setTitulos((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Cancelado" as const,
              historico: [
                ...x.historico,
                { data: hoje(), usuario, descricao: "Cancelado logicamente" },
              ],
            }
          : x,
      ),
    );
  }, []);

  const aprovarTitulo = useCallback((id: string, usuario: string) => {
    setTitulos((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Em aberto" as const,
              historico: [
                ...x.historico,
                { data: hoje(), usuario, descricao: "Aprovado para pagamento" },
              ],
            }
          : x,
      ),
    );
  }, []);

  const devolverTitulo = useCallback((id: string, usuario: string, justificativa: string) => {
    setTitulos((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Cancelado" as const,
              historico: [
                ...x.historico,
                { data: hoje(), usuario, descricao: `Devolvido: ${justificativa}` },
              ],
            }
          : x,
      ),
    );
  }, []);

  const baixarTitulo = useCallback((id: string, baixa: BaixaTitulo, usuario: string) => {
    setTitulos((l) =>
      l.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Pago" as const,
              baixa,
              historico: [
                ...x.historico,
                {
                  data: hoje(),
                  usuario,
                  descricao: `Baixa registrada em ${baixa.conta}`,
                },
              ],
            }
          : x,
      ),
    );
  }, []);

  const lancarTituloDeModulo = useCallback<Ctx["lancarTituloDeModulo"]>((dados) => {
    seqTitulo += 1;
    const novo: TituloPagar = {
      id: `tp-${seqTitulo}`,
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
      historico: [{ data: hoje(), usuario: "Sistema", descricao: `Gerado por ${dados.origem}` }],
    };
    setTitulos((l) => [novo, ...l]);
    return novo;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      parceiros,
      titulos,
      criarParceiro,
      editarParceiro,
      inativarParceiro,
      reativarParceiro,
      emAbertoDoParceiro,
      criarTitulo,
      editarTitulo,
      cancelarTitulo,
      aprovarTitulo,
      devolverTitulo,
      baixarTitulo,
      lancarTituloDeModulo,
    }),
    [
      parceiros,
      titulos,
      criarParceiro,
      editarParceiro,
      inativarParceiro,
      reativarParceiro,
      emAbertoDoParceiro,
      criarTitulo,
      editarTitulo,
      cancelarTitulo,
      aprovarTitulo,
      devolverTitulo,
      baixarTitulo,
      lancarTituloDeModulo,
    ],
  );

  return <DadosCtx.Provider value={value}>{children}</DadosCtx.Provider>;
}

export function useDados() {
  const ctx = useContext(DadosCtx);
  if (!ctx) throw new Error("useDados deve ser usado dentro de DadosProvider");
  return ctx;
}
