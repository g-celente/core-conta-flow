/**
 * MÓDULO EXCLUSIVO — Comissões sobre recebimentos
 * Cliente: TransLog Cargas ME (flag `mod_comissoes`).
 *
 * FRONTEIRA DE ISOLAMENTO
 * Este arquivo é a "tabela própria" do módulo. O núcleo do FinCore não importa
 * nada desta pasta — apenas registra a rota condicionalmente. Os dados de
 * títulos recebidos entram pela interface `EntradaRecebimento` (ver tipos.ts),
 * de modo que o módulo nunca depende do formato interno do núcleo.
 */

export type Vendedor = {
  id: string;
  nome: string;
  /** Percentual de comissão contratado. */
  percentual: number;
  equipe: string;
};

/** Tabela própria do módulo: cadastro de vendedores comissionados. */
export const vendedores: Vendedor[] = [
  { id: "v-1", nome: "Alexandre Prado", percentual: 3, equipe: "Cargas fracionadas" },
  { id: "v-2", nome: "Bianca Moraes", percentual: 2.5, equipe: "Cargas fracionadas" },
  { id: "v-3", nome: "Diego Salvatore", percentual: 4, equipe: "Cargas dedicadas" },
  { id: "v-4", nome: "Elisa Fontana", percentual: 3.5, equipe: "Cargas dedicadas" },
  { id: "v-5", nome: "Fábio Kuroda", percentual: 2, equipe: "Last mile" },
];

export type Competencia = { id: string; rotulo: string };

export const competencias: Competencia[] = [
  { id: "2026-06", rotulo: "Junho/2026" },
  { id: "2026-05", rotulo: "Maio/2026" },
  { id: "2026-04", rotulo: "Abril/2026" },
];

/**
 * Recebimentos por vendedor e competência — tabela própria do módulo.
 * Em produção viria do banco do módulo, alimentado por um job que lê os
 * títulos recebidos através da interface pública do núcleo.
 */
export const recebimentosPorCompetencia: Record<string, Record<string, number>> = {
  "2026-06": {
    "v-1": 184320.5,
    "v-2": 96450.0,
    "v-3": 312800.75,
    "v-4": 148900.0,
    "v-5": 42150.3,
  },
  "2026-05": {
    "v-1": 171200.0,
    "v-2": 88900.4,
    "v-3": 289450.0,
    "v-4": 132600.9,
    "v-5": 38720.0,
  },
  "2026-04": {
    "v-1": 165800.25,
    "v-2": 79300.0,
    "v-3": 274100.5,
    "v-4": 121450.0,
    "v-5": 35980.6,
  },
};

export type StatusComissao = "A aprovar" | "Aprovada" | "Título gerado";

export type LinhaComissao = {
  vendedorId: string;
  vendedor: string;
  equipe: string;
  recebido: number;
  percentual: number;
  comissao: number;
  status: StatusComissao;
};

/** Regra do módulo: percentual sobre o valor de títulos recebidos no mês. */
export function calcularComissoes(competenciaId: string): LinhaComissao[] {
  const recebimentos = recebimentosPorCompetencia[competenciaId] ?? {};
  return vendedores.map((v) => {
    const recebido = recebimentos[v.id] ?? 0;
    return {
      vendedorId: v.id,
      vendedor: v.nome,
      equipe: v.equipe,
      recebido,
      percentual: v.percentual,
      comissao: +((recebido * v.percentual) / 100).toFixed(2),
      status: "A aprovar" as StatusComissao,
    };
  });
}
