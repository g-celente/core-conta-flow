export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const empresas = [
  { id: "emp-1", nome: "Padaria Estrela do Sul Ltda", cnpj: "12.345.678/0001-90" },
  { id: "emp-2", nome: "TransLog Cargas ME", cnpj: "23.456.789/0001-12" },
  { id: "emp-3", nome: "Clínica Vida Plena S/S", cnpj: "34.567.890/0001-45" },
  { id: "emp-4", nome: "Metalúrgica Bandeirantes Ltda", cnpj: "45.678.901/0001-78" },
];

export const usuarios = [
  "Ana Paula Ribeiro",
  "Carlos Eduardo Menezes",
  "Juliana Prado",
  "Marcos Vinícius Tavares",
  "Renata Oliveira",
];

export const dashboardPorEmpresa: Record<
  string,
  { aPagar: number; aReceber: number; saldo: number; inadimplencia: number; fluxo: { mes: string; entradas: number; saidas: number }[] }
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
      entradas: vals.reduce((s, v) => s + v.fluxo[i].entradas, 0),
      saidas: vals.reduce((s, v) => s + v.fluxo[i].saidas, 0),
    })),
  };
};

export const centrosDeCusto = [
  { id: "cc-1", codigo: "CC-100", descricao: "Administrativo", responsavel: "Ana Paula Ribeiro", rateio: 25, mes: 18420.5 },
  { id: "cc-2", codigo: "CC-200", descricao: "Comercial", responsavel: "Carlos Eduardo Menezes", rateio: 35, mes: 42730.9 },
  { id: "cc-3", codigo: "CC-300", descricao: "Produção", responsavel: "Marcos Vinícius Tavares", rateio: 30, mes: 91280.0 },
  { id: "cc-4", codigo: "CC-400", descricao: "Logística", responsavel: "Renata Oliveira", rateio: 10, mes: 26310.75 },
];

export const titulosAPagar = [
  { id: "t-1", fornecedor: "Distribuidora Farinha Nobre Ltda", valor: 18420.5, vencimento: "12/07/2026", lancadoPor: "Juliana Prado" },
  { id: "t-2", fornecedor: "Embalagens Ipiranga ME", valor: 7350.0, vencimento: "15/07/2026", lancadoPor: "Ana Paula Ribeiro" },
  { id: "t-3", fornecedor: "Transportadora Rota Verde S/A", valor: 42980.9, vencimento: "20/07/2026", lancadoPor: "Carlos Eduardo Menezes" },
  { id: "t-4", fornecedor: "Serviços Contábeis Aliança", valor: 3200.0, vencimento: "05/08/2026", lancadoPor: "Renata Oliveira" },
  { id: "t-5", fornecedor: "Energisa Distribuição", valor: 12760.35, vencimento: "08/08/2026", lancadoPor: "Marcos Vinícius Tavares" },
];
