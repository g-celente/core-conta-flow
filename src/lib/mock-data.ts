export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const empresas = [
  { id: "emp-1", nome: "Padaria Estrela do Sul Ltda", cnpj: "12.345.678/0001-90" },
  { id: "emp-2", nome: "TransLog Cargas ME", cnpj: "23.456.789/0001-12" },
  { id: "emp-3", nome: "Clínica Vida Plena S/S", cnpj: "34.567.890/0001-45" },
  { id: "emp-4", nome: "Metalúrgica Bandeirantes Ltda", cnpj: "45.678.901/0001-78" },
];

export const usuarios = [
  "Marina Duarte",
  "Roberto Tanaka",
  "Cláudia Bastos",
  "Paula Nunes",
  "Carlos Eduardo Menezes",
  "Renata Oliveira",
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

export const centrosDeCusto: CentroCusto[] = [
  {
    id: "cc-1",
    codigo: "CC-100",
    descricao: "Administrativo",
    responsavel: "Marina Duarte",
    rateio: 25,
    mes: 18420.5,
  },
  {
    id: "cc-2",
    codigo: "CC-200",
    descricao: "Comercial",
    responsavel: "Carlos Eduardo Menezes",
    rateio: 35,
    mes: 42730.9,
  },
  {
    id: "cc-3",
    codigo: "CC-300",
    descricao: "Operações",
    responsavel: "Roberto Tanaka",
    rateio: 30,
    mes: 91280.0,
  },
  {
    id: "cc-4",
    codigo: "CC-400",
    descricao: "Logística",
    responsavel: "Renata Oliveira",
    rateio: 10,
    mes: 26310.75,
  },
];

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

export const parceirosIniciais: Parceiro[] = [
  {
    id: "pa-1",
    documento: "12.345.678/0001-90",
    razaoSocial: "Distribuidora Farinha Nobre Ltda",
    nomeFantasia: "Farinha Nobre",
    tipo: "Fornecedor",
    email: "financeiro@farinhanobre.com.br",
    telefone: "(11) 3344-5566",
    cidade: "Osasco",
    uf: "SP",
    emAberto: 18420.5,
    ativo: true,
    historico: [
      { data: "02/03/2026", usuario: "Marina Duarte", descricao: "Cadastro criado" },
      { data: "18/05/2026", usuario: "Renata Oliveira", descricao: "Telefone atualizado" },
    ],
  },
  {
    id: "pa-2",
    documento: "23.456.789/0001-12",
    razaoSocial: "Embalagens Ipiranga ME",
    nomeFantasia: "Embalagens Ipiranga",
    tipo: "Fornecedor",
    email: "contato@embipiranga.com.br",
    telefone: "(11) 2222-8899",
    cidade: "São Paulo",
    uf: "SP",
    emAberto: 7350.0,
    ativo: true,
    historico: [{ data: "11/01/2026", usuario: "Marina Duarte", descricao: "Cadastro criado" }],
  },
  {
    id: "pa-3",
    documento: "987.654.321-00",
    razaoSocial: "Carlos Eduardo Silva",
    nomeFantasia: "Carlos Eduardo Silva",
    tipo: "Cliente",
    email: "carlos.silva@email.com",
    telefone: "(11) 99887-1122",
    cidade: "Guarulhos",
    uf: "SP",
    emAberto: 0,
    ativo: true,
    historico: [{ data: "20/02/2026", usuario: "Roberto Tanaka", descricao: "Cadastro criado" }],
  },
  {
    id: "pa-4",
    documento: "45.678.901/0002-11",
    razaoSocial: "Mega Distribuidora Comercial S.A.",
    nomeFantasia: "Mega Distribuidora",
    tipo: "Ambos",
    email: "ap@megadistribuidora.com.br",
    telefone: "(19) 3777-0100",
    cidade: "Campinas",
    uf: "SP",
    emAberto: 4250.5,
    ativo: true,
    historico: [
      { data: "05/12/2025", usuario: "Marina Duarte", descricao: "Cadastro criado" },
      {
        data: "30/04/2026",
        usuario: "Marina Duarte",
        descricao: "Tipo alterado de Cliente para Ambos",
      },
    ],
  },
  {
    id: "pa-5",
    documento: "11.222.333/0001-44",
    razaoSocial: "Serviços de Limpeza Alvorada EIRELI",
    nomeFantasia: "Limpeza Alvorada",
    tipo: "Fornecedor",
    email: "alvorada@servicos.com.br",
    telefone: "(11) 4004-7788",
    cidade: "Barueri",
    uf: "SP",
    emAberto: 0,
    ativo: false,
    historico: [
      { data: "14/08/2025", usuario: "Renata Oliveira", descricao: "Cadastro criado" },
      { data: "09/06/2026", usuario: "Marina Duarte", descricao: "Cadastro inativado" },
    ],
  },
  {
    id: "pa-6",
    documento: "56.789.012/0001-33",
    razaoSocial: "Transportadora Rota Verde S/A",
    nomeFantasia: "Rota Verde",
    tipo: "Fornecedor",
    email: "faturamento@rotaverde.com.br",
    telefone: "(41) 3555-2020",
    cidade: "Curitiba",
    uf: "PR",
    emAberto: 42980.9,
    ativo: true,
    historico: [{ data: "07/09/2025", usuario: "Marina Duarte", descricao: "Cadastro criado" }],
  },
  {
    id: "pa-7",
    documento: "67.890.123/0001-55",
    razaoSocial: "Mercado Central Comércio de Alimentos Ltda",
    nomeFantasia: "Mercado Central",
    tipo: "Cliente",
    email: "compras@mercadocentral.com.br",
    telefone: "(11) 3030-4040",
    cidade: "São Paulo",
    uf: "SP",
    emAberto: 12450.0,
    ativo: true,
    historico: [{ data: "22/10/2025", usuario: "Roberto Tanaka", descricao: "Cadastro criado" }],
  },
];

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

export const titulosPagarIniciais: TituloPagar[] = [
  {
    id: "tp-1",
    documento: "NF-20491",
    parceiroId: "pa-1",
    fornecedor: "Distribuidora Farinha Nobre Ltda",
    categoria: "Insumos de produção",
    vencimento: "10/06/2026",
    valor: 14502.33,
    status: "Atrasado",
    rateio: [{ centroId: "cc-3", percentual: 100 }],
    lancadoPor: "Marina Duarte",
    historico: [{ data: "12/05/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
  {
    id: "tp-2",
    documento: "FAT-8821",
    parceiroId: "pa-2",
    fornecedor: "Embalagens Ipiranga ME",
    categoria: "Material de embalagem",
    vencimento: "24/06/2026",
    valor: 850.0,
    status: "Em aberto",
    rateio: [{ centroId: "cc-1", percentual: 100 }],
    parcela: "3/12",
    lancadoPor: "Renata Oliveira",
    historico: [{ data: "20/05/2026", usuario: "Renata Oliveira", descricao: "Título lançado" }],
  },
  {
    id: "tp-3",
    documento: "Conta 06/26",
    parceiroId: "pa-6",
    fornecedor: "Transportadora Rota Verde S/A",
    categoria: "Fretes",
    vencimento: "25/06/2026",
    valor: 42980.9,
    status: "Aprovação pendente",
    rateio: [
      { centroId: "cc-4", percentual: 70 },
      { centroId: "cc-3", percentual: 30 },
    ],
    recorrencia: "Mensal",
    lancadoPor: "Marina Duarte",
    historico: [{ data: "01/06/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
  {
    id: "tp-4",
    documento: "FAT-9902",
    parceiroId: "pa-4",
    fornecedor: "Mega Distribuidora Comercial S.A.",
    categoria: "Telecomunicações",
    vencimento: "25/06/2026",
    valor: 945.8,
    status: "Em aberto",
    rateio: [{ centroId: "cc-1", percentual: 100 }],
    lancadoPor: "Marina Duarte",
    historico: [{ data: "02/06/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
  {
    id: "tp-5",
    documento: "NF-11234",
    parceiroId: "pa-5",
    fornecedor: "Serviços de Limpeza Alvorada EIRELI",
    categoria: "Serviços gerais",
    vencimento: "20/05/2026",
    valor: 5120.0,
    status: "Pago",
    rateio: [{ centroId: "cc-1", percentual: 100 }],
    lancadoPor: "Renata Oliveira",
    baixa: {
      data: "20/05/2026",
      valorPago: 5120.0,
      juros: 0,
      desconto: 0,
      conta: "Itaú — CC 12345-6",
    },
    historico: [
      { data: "02/05/2026", usuario: "Renata Oliveira", descricao: "Título lançado" },
      { data: "20/05/2026", usuario: "Marina Duarte", descricao: "Baixa registrada" },
    ],
  },
  {
    id: "tp-6",
    documento: "IN-9912",
    parceiroId: "pa-2",
    fornecedor: "Embalagens Ipiranga ME",
    categoria: "Material de embalagem",
    vencimento: "28/06/2026",
    valor: 8900.45,
    status: "Em aberto",
    rateio: [{ centroId: "cc-3", percentual: 100 }],
    lancadoPor: "Marina Duarte",
    historico: [{ data: "05/06/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
  {
    id: "tp-7",
    documento: "Boleto 06/26",
    parceiroId: "pa-1",
    fornecedor: "Distribuidora Farinha Nobre Ltda",
    categoria: "Insumos de produção",
    vencimento: "30/06/2026",
    valor: 2500.0,
    status: "Agendado",
    rateio: [{ centroId: "cc-3", percentual: 100 }],
    parcela: "12/24",
    lancadoPor: "Renata Oliveira",
    historico: [{ data: "06/06/2026", usuario: "Renata Oliveira", descricao: "Título lançado" }],
  },
  {
    id: "tp-8",
    documento: "NF-5541",
    parceiroId: "pa-4",
    fornecedor: "Mega Distribuidora Comercial S.A.",
    categoria: "Benefícios",
    vencimento: "15/06/2026",
    valor: 18400.0,
    status: "Aprovação pendente",
    rateio: [
      { centroId: "cc-1", percentual: 50 },
      { centroId: "cc-2", percentual: 50 },
    ],
    lancadoPor: "Renata Oliveira",
    historico: [{ data: "01/06/2026", usuario: "Renata Oliveira", descricao: "Título lançado" }],
  },
  {
    id: "tp-9",
    documento: "Conta 05/26",
    parceiroId: "pa-6",
    fornecedor: "Transportadora Rota Verde S/A",
    categoria: "Fretes",
    vencimento: "01/06/2026",
    valor: 890.4,
    status: "Atrasado",
    rateio: [{ centroId: "cc-4", percentual: 100 }],
    lancadoPor: "Marina Duarte",
    historico: [{ data: "10/05/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
  {
    id: "tp-10",
    documento: "NF-088",
    parceiroId: "pa-7",
    fornecedor: "Mercado Central Comércio de Alimentos Ltda",
    categoria: "Serviços de marketing",
    vencimento: "10/07/2026",
    valor: 6500.0,
    status: "Em aberto",
    rateio: [{ centroId: "cc-2", percentual: 100 }],
    lancadoPor: "Marina Duarte",
    historico: [{ data: "08/06/2026", usuario: "Marina Duarte", descricao: "Título lançado" }],
  },
];

export const categoriasDespesa = [
  "Insumos de produção",
  "Material de embalagem",
  "Fretes",
  "Telecomunicações",
  "Serviços gerais",
  "Serviços de marketing",
  "Benefícios",
  "Impostos e taxas",
  "Comissões",
];

export const contasBancarias = [
  "Itaú — CC 12345-6",
  "Bradesco — CC 9876-5",
  "Banco do Brasil — CC 98765-4",
  "Caixa — CC 0001-9",
];

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

export const titulosReceber: TituloReceber[] = [
  {
    id: "tr-1",
    documento: "NFE-4501",
    cliente: "Tech Solutions Brasil Sistemas Ltda",
    categoria: "Serviços mensais",
    vencimento: "05/05/2026",
    valor: 4500.0,
    atraso: 35,
    status: "Em atraso",
  },
  {
    id: "tr-2",
    documento: "NFE-4522",
    cliente: "Mercado Central Comércio de Alimentos Ltda",
    categoria: "Licenciamento",
    vencimento: "15/07/2026",
    valor: 12350.0,
    atraso: 0,
    status: "A vencer",
  },
  {
    id: "tr-3",
    documento: "NFE-4498",
    cliente: "Carlos Eduardo Silva",
    categoria: "Equipamentos",
    vencimento: "01/06/2026",
    valor: 8900.0,
    atraso: 0,
    status: "Recebido",
  },
  {
    id: "tr-4",
    documento: "NFE-3902",
    cliente: "Varejo Central ME",
    categoria: "Consultoria",
    vencimento: "15/02/2026",
    valor: 15000.0,
    atraso: 125,
    status: "Em atraso",
  },
  {
    id: "tr-5",
    documento: "NFE-4530",
    cliente: "Mega Distribuidora Comercial S.A.",
    categoria: "Manutenção",
    vencimento: "20/07/2026",
    valor: 3200.5,
    atraso: 0,
    status: "A vencer",
  },
  {
    id: "tr-6",
    documento: "NFE-4444",
    cliente: "Indústria Mendes EPP",
    categoria: "Serviços mensais",
    vencimento: "20/05/2026",
    valor: 6480.0,
    atraso: 20,
    status: "Em atraso",
  },
  {
    id: "tr-7",
    documento: "NFE-4390",
    cliente: "Comercial Silva Ltda",
    categoria: "Licenciamento",
    vencimento: "02/04/2026",
    valor: 9750.0,
    atraso: 68,
    status: "Em atraso",
  },
  {
    id: "tr-8",
    documento: "NFE-4310",
    cliente: "Logística Rápida S.A.",
    categoria: "Consultoria",
    vencimento: "10/03/2026",
    valor: 5200.0,
    atraso: 91,
    status: "Em atraso",
  },
  {
    id: "tr-9",
    documento: "NFE-4540",
    cliente: "Tech Solutions Brasil Sistemas Ltda",
    categoria: "Serviços mensais",
    vencimento: "28/07/2026",
    valor: 4500.0,
    atraso: 0,
    status: "A vencer",
  },
  {
    id: "tr-10",
    documento: "NFE-4551",
    cliente: "Mercado Central Comércio de Alimentos Ltda",
    categoria: "Equipamentos",
    vencimento: "05/08/2026",
    valor: 22800.0,
    atraso: 0,
    status: "A vencer",
  },
];

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
  codigo: string;
  descricao: string;
  nivel: number;
  tipo: "SINTÉTICA" | "ANALÍTICA";
  saldo: number;
  grupo: "Ativo" | "Passivo" | "Receitas" | "Despesas";
};

export const planoDeContas: ContaPlano[] = [
  {
    codigo: "1.0.0.0.00",
    descricao: "Ativo",
    nivel: 0,
    tipo: "SINTÉTICA",
    saldo: 3450210.55,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.0.0.00",
    descricao: "Ativo Circulante",
    nivel: 1,
    tipo: "SINTÉTICA",
    saldo: 2100000.0,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.1.0.00",
    descricao: "Disponibilidades (Caixa e Bancos)",
    nivel: 2,
    tipo: "SINTÉTICA",
    saldo: 1550000.0,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.1.1.01",
    descricao: "Caixa Geral Matriz",
    nivel: 3,
    tipo: "ANALÍTICA",
    saldo: 50000.0,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.1.2.01",
    descricao: "Banco Itaú S/A — C/C 1234-5",
    nivel: 3,
    tipo: "ANALÍTICA",
    saldo: 1500000.0,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.2.0.00",
    descricao: "Contas a Receber de Clientes",
    nivel: 2,
    tipo: "SINTÉTICA",
    saldo: 550000.0,
    grupo: "Ativo",
  },
  {
    codigo: "1.1.2.1.01",
    descricao: "Duplicatas a Receber",
    nivel: 3,
    tipo: "ANALÍTICA",
    saldo: 550000.0,
    grupo: "Ativo",
  },
  {
    codigo: "2.0.0.0.00",
    descricao: "Passivo",
    nivel: 0,
    tipo: "SINTÉTICA",
    saldo: 1280400.0,
    grupo: "Passivo",
  },
  {
    codigo: "2.1.0.0.00",
    descricao: "Passivo Circulante",
    nivel: 1,
    tipo: "SINTÉTICA",
    saldo: 980400.0,
    grupo: "Passivo",
  },
  {
    codigo: "2.1.1.1.01",
    descricao: "Fornecedores Nacionais",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 620400.0,
    grupo: "Passivo",
  },
  {
    codigo: "2.1.2.1.01",
    descricao: "Obrigações Tributárias",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 360000.0,
    grupo: "Passivo",
  },
  {
    codigo: "3.0.0.0.00",
    descricao: "Receitas",
    nivel: 0,
    tipo: "SINTÉTICA",
    saldo: 8950000.0,
    grupo: "Receitas",
  },
  {
    codigo: "3.1.0.0.00",
    descricao: "Receitas Operacionais",
    nivel: 1,
    tipo: "SINTÉTICA",
    saldo: 8950000.0,
    grupo: "Receitas",
  },
  {
    codigo: "3.1.1.1.01",
    descricao: "Venda de Produtos — Mercado Interno",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 8950000.0,
    grupo: "Receitas",
  },
  {
    codigo: "4.0.0.0.00",
    descricao: "Despesas",
    nivel: 0,
    tipo: "SINTÉTICA",
    saldo: 6420310.0,
    grupo: "Despesas",
  },
  {
    codigo: "4.1.0.0.00",
    descricao: "Despesas Operacionais",
    nivel: 1,
    tipo: "SINTÉTICA",
    saldo: 5120310.0,
    grupo: "Despesas",
  },
  {
    codigo: "4.1.1.1.01",
    descricao: "Despesas com Pessoal",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 3120310.0,
    grupo: "Despesas",
  },
  {
    codigo: "4.1.2.1.01",
    descricao: "Despesas Administrativas",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 2000000.0,
    grupo: "Despesas",
  },
  {
    codigo: "4.2.0.0.00",
    descricao: "Despesas Financeiras",
    nivel: 1,
    tipo: "SINTÉTICA",
    saldo: 1300000.0,
    grupo: "Despesas",
  },
  {
    codigo: "4.2.1.1.01",
    descricao: "Juros e Multas Pagos",
    nivel: 2,
    tipo: "ANALÍTICA",
    saldo: 1300000.0,
    grupo: "Despesas",
  },
];

/** PV1: contas extras sugeridas conforme o regime tributário do tenant. */
export const contasPorRegime: Record<string, ContaPlano[]> = {
  "Simples Nacional": [
    {
      codigo: "2.1.2.1.02",
      descricao: "DAS — Simples Nacional a Recolher",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 42800.0,
      grupo: "Passivo",
    },
  ],
  "Lucro Presumido": [
    {
      codigo: "2.1.2.1.03",
      descricao: "IRPJ/CSLL sobre Presunção a Recolher",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 118400.0,
      grupo: "Passivo",
    },
    {
      codigo: "2.1.2.1.04",
      descricao: "PIS/COFINS Cumulativo a Recolher",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 64200.0,
      grupo: "Passivo",
    },
  ],
  "Lucro Real": [
    {
      codigo: "2.1.2.1.05",
      descricao: "IRPJ/CSLL sobre Lucro Real a Recolher",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 289400.0,
      grupo: "Passivo",
    },
    {
      codigo: "2.1.2.1.06",
      descricao: "PIS/COFINS Não Cumulativo a Recolher",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 176900.0,
      grupo: "Passivo",
    },
    {
      codigo: "1.1.3.1.01",
      descricao: "Créditos de PIS/COFINS a Recuperar",
      nivel: 2,
      tipo: "ANALÍTICA",
      saldo: 98300.0,
      grupo: "Ativo",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Conciliação e importação                                            */
/* ------------------------------------------------------------------ */

export type ParConciliacao = {
  id: string;
  extrato: { data: string; descricao: string; valor: number };
  sistema: { data: string; descricao: string; valor: number };
  conciliado: boolean;
  confianca: "alta" | "média";
};

export const paresConciliacao: ParConciliacao[] = [
  {
    id: "pc-1",
    extrato: { data: "01/06/2026", descricao: "TED RECEBIDA - MERCADO CENTRAL", valor: 12450.0 },
    sistema: { data: "01/06/2026", descricao: "NFE-4521 — Mercado Central Ltda", valor: 12450.0 },
    conciliado: true,
    confianca: "alta",
  },
  {
    id: "pc-2",
    extrato: { data: "02/06/2026", descricao: "PIX ENVIADO - EMBALAGENS IPIRANGA", valor: 7350.0 },
    sistema: {
      data: "02/06/2026",
      descricao: "Título FAT-8821 — Embalagens Ipiranga ME",
      valor: 7350.0,
    },
    conciliado: false,
    confianca: "alta",
  },
  {
    id: "pc-3",
    extrato: { data: "05/06/2026", descricao: "BOLETO PAGO - ENERGISA", valor: 12760.35 },
    sistema: { data: "04/06/2026", descricao: "Energia elétrica — junho/2026", valor: 12758.9 },
    conciliado: false,
    confianca: "média",
  },
  {
    id: "pc-4",
    extrato: { data: "08/06/2026", descricao: "DEPOSITO DINHEIRO - CAIXA LOJA 2", valor: 4820.75 },
    sistema: { data: "08/06/2026", descricao: "Fechamento de caixa Loja 2", valor: 4820.75 },
    conciliado: false,
    confianca: "alta",
  },
];

export type LinhaExtrato = {
  linha: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: "Crédito" | "Débito";
  erro?: string;
};

export const linhasExtrato: LinhaExtrato[] = [
  {
    linha: 12,
    data: "01/06/2026",
    descricao: "TED RECEBIDA - MERCADO CENTRAL LTDA",
    valor: 12450.0,
    tipo: "Crédito",
  },
  {
    linha: 18,
    data: "02/06/2026",
    descricao: "PIX ENVIADO - EMBALAGENS IPIRANGA ME",
    valor: 7350.0,
    tipo: "Débito",
  },
  {
    linha: 23,
    data: "03/06/2026",
    descricao: "TARIFA PACOTE SERVICOS",
    valor: 89.9,
    tipo: "Débito",
  },
  {
    linha: 42,
    data: "04/06/2026",
    descricao: "REGISTRO TRUNCADO",
    valor: 0,
    tipo: "Débito",
    erro: "Campo de valor inválido no segmento (posição 142-155).",
  },
  {
    linha: 55,
    data: "05/06/2026",
    descricao: "BOLETO PAGO - ENERGISA DISTRIBUICAO",
    valor: 12760.35,
    tipo: "Débito",
  },
  {
    linha: 71,
    data: "06/06/2026",
    descricao: "DATA FORA DO PERIODO",
    valor: 3200.0,
    tipo: "Crédito",
    erro: "Data 31/02/2026 inexistente.",
  },
  {
    linha: 88,
    data: "08/06/2026",
    descricao: "DEPOSITO DINHEIRO - CAIXA LOJA 2",
    valor: 4820.75,
    tipo: "Crédito",
  },
];

/* ------------------------------------------------------------------ */
/* Relatórios                                                          */
/* ------------------------------------------------------------------ */

export type Relatorio = {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  /** Quando definida, o relatório só aparece se a feature estiver ativa. */
  requer?: "centro_custo" | "multiempresa" | "conciliacao";
};

export const relatorios: Relatorio[] = [
  {
    id: "fluxo",
    nome: "Fluxo de Caixa Projetado",
    descricao: "Previsão detalhada de entradas e saídas para os próximos ciclos.",
    icone: "waterfall_chart",
  },
  {
    id: "dre",
    nome: "DRE Gerencial",
    descricao: "Demonstração do Resultado estruturada para análise de performance.",
    icone: "stacked_bar_chart",
  },
  {
    id: "cc",
    nome: "Contas por Centro de Custo",
    descricao: "Distribuição de despesas e receitas alocadas por departamento.",
    icone: "pie_chart",
    requer: "centro_custo",
  },
  {
    id: "inad",
    nome: "Inadimplência",
    descricao: "Análise de contas a receber vencidas e risco de carteira.",
    icone: "trending_down",
  },
  {
    id: "razao",
    nome: "Razão de Fornecedor",
    descricao: "Histórico detalhado de movimentações e saldo por fornecedor.",
    icone: "receipt_long",
  },
  {
    id: "consol",
    nome: "Consolidado do Grupo",
    descricao: "Resultado somado de todos os CNPJs sob a conta raiz.",
    icone: "domain",
    requer: "multiempresa",
  },
  {
    id: "concil",
    nome: "Extrato Conciliado",
    descricao: "Espelho do extrato bancário com o status de cada conciliação.",
    icone: "account_balance",
    requer: "conciliacao",
  },
];

export const dre = [
  { conta: "Receita bruta de vendas", valor: 611200.25, tipo: "receita" as const },
  { conta: "(–) Deduções e impostos sobre vendas", valor: -78456.03, tipo: "deducao" as const },
  { conta: "= Receita líquida", valor: 532744.22, tipo: "subtotal" as const },
  { conta: "(–) Custo das mercadorias vendidas", valor: -246380.1, tipo: "deducao" as const },
  { conta: "= Lucro bruto", valor: 286364.12, tipo: "subtotal" as const },
  { conta: "(–) Despesas administrativas", valor: -84520.35, tipo: "deducao" as const },
  { conta: "(–) Despesas comerciais", valor: -42730.9, tipo: "deducao" as const },
  { conta: "(–) Despesas financeiras", valor: -12940.0, tipo: "deducao" as const },
  { conta: "= Resultado do exercício", valor: 146172.87, tipo: "total" as const },
];

export const fluxoProjetado = [
  { mes: "Jul/2026", entradas: 622000, saidas: 511000 },
  { mes: "Ago/2026", entradas: 598400, saidas: 540200 },
  { mes: "Set/2026", entradas: 651300, saidas: 498700 },
  { mes: "Out/2026", entradas: 604900, saidas: 612400 },
  { mes: "Nov/2026", entradas: 688200, saidas: 523100 },
  { mes: "Dez/2026", entradas: 742500, saidas: 610800 },
];
