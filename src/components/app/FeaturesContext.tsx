import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { empresas } from "@/lib/mock-data";
import { useEmpresa } from "./EmpresaContext";

/**
 * Pontos de variação (PV) do FinCore.
 * PV1 Regime tributário · PV2 Adaptador bancário · PV3 Alçada de aprovação
 * PV4 Portal do contador · PV5 Notificações · PV6 Conciliação · PV7 Escala/Extensões
 */
export type Feature =
  | "conciliacao"
  | "alcada"
  | "centro_custo"
  | "multiempresa"
  | "portal_contador"
  | "api_publica"
  | "notificacoes_push"
  | "mod_comissoes";

export type AdaptadorBancario = "OFX" | "CNAB240" | "CNAB400";
export type Regime = "Simples Nacional" | "Lucro Presumido" | "Lucro Real";
export type PerfilProduto = "Essencial" | "Profissional" | "Corporativo" | "Contábil";

export type ConfigTenant = {
  perfilProduto: PerfilProduto;
  features: Record<Feature, boolean>;
  adaptador: AdaptadorBancario;
  regime: Regime;
};

export const TODAS_FEATURES: { id: Feature; nome: string; descricao: string; pv: string }[] = [
  {
    id: "conciliacao",
    nome: "Conciliação Bancária",
    descricao:
      "Habilita o módulo de importação de extratos e cruzamento automático com lançamentos financeiros.",
    pv: "PV2/PV6",
  },
  {
    id: "alcada",
    nome: "Aprovação por Alçada",
    descricao:
      "Requer aprovação hierárquica para pagamentos que excedam limites configurados por perfil.",
    pv: "PV3",
  },
  {
    id: "centro_custo",
    nome: "Centro de Custo",
    descricao:
      "Exibe coluna, filtro e bloco de rateio por departamento nos lançamentos de despesa e receita.",
    pv: "PV7",
  },
  {
    id: "multiempresa",
    nome: "Multiempresa",
    descricao:
      "Habilita a gestão de múltiplos CNPJs sob a mesma conta raiz, com visão consolidada.",
    pv: "PV7",
  },
  {
    id: "portal_contador",
    nome: "Portal do Contador",
    descricao:
      "Cria um acesso somente leitura para a contabilidade exportar balancetes e arquivos fiscais.",
    pv: "PV4",
  },
  {
    id: "api_publica",
    nome: "API Pública",
    descricao: "Habilita a central de integrações com tokens de acesso REST e ambiente de sandbox.",
    pv: "PV7",
  },
  {
    id: "notificacoes_push",
    nome: "Notificações Push",
    descricao: "Envia alertas de vencimento e aprovação por push além de e-mail e in-app.",
    pv: "PV5",
  },
  {
    id: "mod_comissoes",
    nome: "Módulo de Comissões",
    descricao:
      "Extensão exclusiva contratada por um único cliente: comissões sobre títulos recebidos.",
    pv: "PV7",
  },
];

const nenhuma: Record<Feature, boolean> = {
  conciliacao: false,
  alcada: false,
  centro_custo: false,
  multiempresa: false,
  portal_contador: false,
  api_publica: false,
  notificacoes_push: false,
  mod_comissoes: false,
};

/** Perfil de produto de cada tenant, conforme contrato comercial. */
const configIniciais: Record<string, ConfigTenant> = {
  // Padaria Estrela do Sul — Essencial (só o núcleo)
  "emp-1": {
    perfilProduto: "Essencial",
    features: { ...nenhuma },
    adaptador: "OFX",
    regime: "Simples Nacional",
  },
  // TransLog Cargas — Profissional + módulo exclusivo de comissões
  "emp-2": {
    perfilProduto: "Profissional",
    features: {
      ...nenhuma,
      conciliacao: true,
      alcada: true,
      centro_custo: true,
      notificacoes_push: true,
      mod_comissoes: true,
    },
    adaptador: "CNAB240",
    regime: "Lucro Presumido",
  },
  // Clínica Vida Plena — Profissional + portal do contador
  "emp-3": {
    perfilProduto: "Contábil",
    features: {
      ...nenhuma,
      conciliacao: true,
      alcada: true,
      centro_custo: true,
      notificacoes_push: true,
      portal_contador: true,
    },
    adaptador: "OFX",
    regime: "Simples Nacional",
  },
  // Metalúrgica Bandeirantes — Corporativo (Profissional + multiempresa + API)
  "emp-4": {
    perfilProduto: "Corporativo",
    features: {
      ...nenhuma,
      conciliacao: true,
      alcada: true,
      centro_custo: true,
      notificacoes_push: true,
      multiempresa: true,
      api_publica: true,
    },
    adaptador: "CNAB400",
    regime: "Lucro Real",
  },
};

type Ctx = {
  /** Configuração do tenant selecionado. */
  config: ConfigTenant;
  /** Atalho: a feature está ativa no tenant atual? */
  has: (f: Feature) => boolean;
  setFeature: (f: Feature, valor: boolean) => void;
  setAdaptador: (a: AdaptadorBancario) => void;
  setRegime: (r: Regime) => void;
  /** Configurações de todos os tenants (usado pela ficha de configuração). */
  todas: Record<string, ConfigTenant>;
};

const FeaturesCtx = createContext<Ctx | null>(null);

/** Consolidado usa a união das features das empresas com multiempresa ativa. */
function configConsolidada(todas: Record<string, ConfigTenant>): ConfigTenant {
  const base = todas["emp-4"] ?? configIniciais["emp-4"]!;
  return { ...base, features: { ...base.features, mod_comissoes: false } };
}

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const { empresaId, consolidado } = useEmpresa();
  const [todas, setTodas] = useState<Record<string, ConfigTenant>>(configIniciais);

  const config = consolidado
    ? configConsolidada(todas)
    : (todas[empresaId] ?? configIniciais["emp-1"]!);

  const setFeature = useCallback(
    (f: Feature, valor: boolean) =>
      setTodas((t) => {
        const atual = t[empresaId];
        if (!atual) return t;
        return { ...t, [empresaId]: { ...atual, features: { ...atual.features, [f]: valor } } };
      }),
    [empresaId],
  );

  const setAdaptador = useCallback(
    (a: AdaptadorBancario) =>
      setTodas((t) => {
        const atual = t[empresaId];
        if (!atual) return t;
        return { ...t, [empresaId]: { ...atual, adaptador: a } };
      }),
    [empresaId],
  );

  const setRegime = useCallback(
    (r: Regime) =>
      setTodas((t) => {
        const atual = t[empresaId];
        if (!atual) return t;
        return { ...t, [empresaId]: { ...atual, regime: r } };
      }),
    [empresaId],
  );

  const value = useMemo<Ctx>(
    () => ({
      config,
      has: (f: Feature) => config.features[f],
      setFeature,
      setAdaptador,
      setRegime,
      todas,
    }),
    [config, setFeature, setAdaptador, setRegime, todas],
  );

  return <FeaturesCtx.Provider value={value}>{children}</FeaturesCtx.Provider>;
}

export function useFeatures() {
  const ctx = useContext(FeaturesCtx);
  if (!ctx) throw new Error("useFeatures deve ser usado dentro de FeaturesProvider");
  return ctx;
}

export const nomeEmpresa = (id: string) => empresas.find((e) => e.id === id)?.nome ?? id;
