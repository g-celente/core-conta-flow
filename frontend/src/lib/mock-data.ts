export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Limite da alçada do operador enquanto o cadastro de alçadas carrega. */
export const LIMITE_ALCADA_OPERADOR = 10000;

/* Cadastros gravados no banco (item 02). */
export type Alcada = {
  id: string;
  perfil: string;
  titular: string;
  limite: number;
  substituto: string;
};
export type ContaBancaria = {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  descricao: string;
  ativa: boolean;
};
export type CategoriaDespesa = { id: string; nome: string; ativa: boolean };
export type Usuario = { id: string; nome: string; email: string; perfil: string; ativo: boolean };
export type FormaPagamento = { id: string; nome: string; ativa: boolean };

export const empresas = [
  { id: "emp-1", nome: "Padaria Estrela do Sul Ltda", cnpj: "12.345.678/0001-90" },
  { id: "emp-2", nome: "TransLog Cargas ME", cnpj: "23.456.789/0001-12" },
  { id: "emp-3", nome: "Clínica Vida Plena S/S", cnpj: "34.567.890/0001-45" },
  { id: "emp-4", nome: "Metalúrgica Bandeirantes Ltda", cnpj: "45.678.901/0001-78" },
];

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const dashboardPorEmpresa: Record<
  string,
  {
    aPagar: number;
    aReceber: number;
    saldo: number;
    inadimplencia: number;
    fluxo: { mes: string; entradas: number; saidas: number }[];
  }
> = {
  "emp-1": {
    aPagar: 84520.35,
    aReceber: 132980.9,
    saldo: 61240.12,
    inadimplencia: 4.2,
    fluxo: [
      { mes: "Abr", entradas: 118000, saidas: 92000 },
      { mes: "Mai", entradas: 126500, saidas: 98400 },
      { mes: "Jun", entradas: 132980, saidas: 84520 },
    ],
  },
  "emp-2": {
    aPagar: 213400.0,
    aReceber: 189320.45,
    saldo: -18420.3,
    inadimplencia: 9.7,
    fluxo: [
      { mes: "Abr", entradas: 172000, saidas: 181000 },
      { mes: "Mai", entradas: 180400, saidas: 196700 },
      { mes: "Jun", entradas: 189320, saidas: 213400 },
    ],
  },
  "emp-3": {
    aPagar: 47210.8,
    aReceber: 96540.0,
    saldo: 78310.55,
    inadimplencia: 2.1,
    fluxo: [
      { mes: "Abr", entradas: 88000, saidas: 42000 },
      { mes: "Mai", entradas: 91200, saidas: 45100 },
      { mes: "Jun", entradas: 96540, saidas: 47210 },
    ],
  },
  "emp-4": {
    aPagar: 502870.6,
    aReceber: 611200.25,
    saldo: 245900.0,
    inadimplencia: 6.4,
    fluxo: [
      { mes: "Abr", entradas: 540000, saidas: 470000 },
      { mes: "Mai", entradas: 578000, saidas: 495000 },
      { mes: "Jun", entradas: 611200, saidas: 502870 },
    ],
  },
};

export const consolidado = () => {
  const vals = Object.values(dashboardPorEmpresa);
  return {
    aPagar: vals.reduce((s, v) => s + v.aPagar, 0),
    aReceber: vals.reduce((s, v) => s + v.aReceber, 0),
    saldo: vals.reduce((s, v) => s + v.saldo, 0),
    inadimplencia: +(vals.reduce((s, v) => s + v.inadimplencia, 0) / vals.length).toFixed(1),
    fluxo: ["Abr", "Mai", "Jun"].map((mes, i) => ({
      mes,
      entradas: vals.reduce((s, v) => s + (v.fluxo[i]?.entradas ?? 0), 0),
      saidas: vals.reduce((s, v) => s + (v.fluxo[i]?.saidas ?? 0), 0),
    })),
  };
};

/* ------------------------------------------------------------------ */
/* Centros de custo (PV7 — feature centro_custo)                       */
/* ------------------------------------------------------------------ */

export type CentroCusto = {
  id: string;
  codigo: string;
  descricao: string;
  responsavel: string;
  rateio: number;
  mes: number;
};

/* ------------------------------------------------------------------ */
/* Parceiros (clientes e fornecedores) — CRUD completo                 */
/* ------------------------------------------------------------------ */

export type TipoParceiro = "Cliente" | "Fornecedor" | "Ambos";

export type Alteracao = { data: string; usuario: string; descricao: string };

export type Parceiro = {
  id: string;
  documento: string;
  razaoSocial: string;
  nomeFantasia: string;
  tipo: TipoParceiro;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  emAberto: number;
  ativo: boolean;
  historico: Alteracao[];
};

/** Base mock consultada ao digitar o CNPJ no formulário de parceiro. */
export const baseCnpj: Record<
  string,
  { razaoSocial: string; nomeFantasia: string; cidade: string; uf: string }
> = {
  "78.901.234/0001-66": {
    razaoSocial: "Papelaria Horizonte Comércio Ltda",
    nomeFantasia: "Papelaria Horizonte",
    cidade: "Santo André",
    uf: "SP",
  },
  "89.012.345/0001-77": {
    razaoSocial: "Energisa Distribuição S.A.",
    nomeFantasia: "Energisa",
    cidade: "Cataguases",
    uf: "MG",
  },
  "90.123.456/0001-88": {
    razaoSocial: "Consultoria Aliança Contábil Ltda",
    nomeFantasia: "Aliança Contábil",
    cidade: "Belo Horizonte",
    uf: "MG",
  },
  "01.234.567/0001-99": {
    razaoSocial: "Tech Solutions Brasil Sistemas Ltda",
    nomeFantasia: "Tech Solutions",
    cidade: "Florianópolis",
    uf: "SC",
  },
};

export const cnpjSugeridos = Object.keys(baseCnpj);

/* ------------------------------------------------------------------ */
/* Títulos a pagar — CRUD completo                                     */
/* ------------------------------------------------------------------ */

export type StatusTitulo =
  "Em aberto" | "Aprovação pendente" | "Agendado" | "Pago" | "Atrasado" | "Cancelado";

export type RateioLinha = { centroId: string; percentual: number };

export type BaixaTitulo = {
  data: string;
  valorPago: number;
  juros: number;
  desconto: number;
  conta: string;
};

export type TituloPagar = {
  id: string;
  documento: string;
  parceiroId: string;
  fornecedor: string;
  categoria: string;
  vencimento: string;
  valor: number;
  status: StatusTitulo;
  rateio: RateioLinha[];
  parcela?: string;
  recorrencia?: string;
  origem?: string;
  lancadoPor: string;
  baixa?: BaixaTitulo;
  historico: Alteracao[];
};

/* ------------------------------------------------------------------ */
/* Títulos a receber com aging                                         */
/* ------------------------------------------------------------------ */

export type TituloReceber = {
  id: string;
  documento: string;
  cliente: string;
  categoria: string;
  vencimento: string;
  valor: number;
  /** Dias de atraso; 0 = a vencer. */
  atraso: number;
  status: "A vencer" | "Recebido" | "Em atraso";
};

export type Faixa = {
  id: string;
  rotulo: string;
  min: number;
  max: number;
  icone: string;
  tom: "ok" | "atencao" | "erro" | "critico";
};

export const faixasAging: Faixa[] = [
  { id: "a-vencer", rotulo: "A vencer", min: -9999, max: 0, icone: "event_upcoming", tom: "ok" },
  { id: "1-30", rotulo: "1–30 dias", min: 1, max: 30, icone: "warning", tom: "atencao" },
  { id: "31-60", rotulo: "31–60 dias", min: 31, max: 60, icone: "history", tom: "atencao" },
  { id: "61-90", rotulo: "61–90 dias", min: 61, max: 90, icone: "error", tom: "erro" },
  { id: "90+", rotulo: "Mais de 90", min: 91, max: 99999, icone: "dangerous", tom: "critico" },
];

/* ------------------------------------------------------------------ */
/* Plano de contas                                                     */
/* ------------------------------------------------------------------ */

export type ContaPlano = {
  id: string;
  codigo: string;
  descricao: string;
  nivel: number;
  tipo: "SINTÉTICA" | "ANALÍTICA";
  saldo: number;
  grupo: "Ativo" | "Passivo" | "Receitas" | "Despesas";
};

/* PV1: o plano base e as contas tributárias de cada regime vêm do backend (pacote planodecontas). */

/* As linhas do extrato são lidas pelo backend (pacote extrato), a partir dos arquivos de exemplo. */
