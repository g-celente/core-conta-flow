import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PerfilAcesso = "operador" | "aprovador" | "contador" | "implantador";

export type DefPerfil = {
  id: PerfilAcesso;
  nome: string;
  usuario: string;
  email: string;
  iniciais: string;
  descricao: string;
  /** Somente leitura: esconde botões de criar/editar/inativar. */
  somenteLeitura: boolean;
  /** null = acessa tudo; array = lista branca de rotas. */
  rotas: string[] | null;
};

export const PERFIS: DefPerfil[] = [
  {
    id: "operador",
    nome: "Operador financeiro",
    usuario: "Marina Duarte",
    email: "marina@fincore.app",
    iniciais: "MD",
    descricao: "Lança, edita e baixa títulos. Acesso a todas as telas contratadas.",
    somenteLeitura: false,
    rotas: null,
  },
  {
    id: "aprovador",
    nome: "Aprovador",
    usuario: "Roberto Tanaka",
    email: "roberto@fincore.app",
    iniciais: "RT",
    descricao: "Vê apenas dashboard, fila de aprovação e relatórios.",
    somenteLeitura: false,
    rotas: ["/", "/aprovacoes", "/alcadas", "/relatorios", "/auditoria"],
  },
  {
    id: "contador",
    nome: "Contador externo",
    usuario: "Cláudia Bastos",
    email: "claudia@contabil.app",
    iniciais: "CB",
    descricao: "Somente leitura: listagens, conciliação e exportações.",
    somenteLeitura: true,
    rotas: [
      "/",
      "/contas-a-pagar",
      "/contas-a-receber",
      "/parceiros",
      "/plano-de-contas",
      "/conciliacao",
      "/importar-extrato",
      "/relatorios",
      "/exportacoes",
      "/auditoria",
    ],
  },
  {
    id: "implantador",
    nome: "Implantador",
    usuario: "Paula Nunes",
    email: "paula@fincore.app",
    iniciais: "PN",
    descricao: "Configura features, executa a instanciação e homologa o tenant.",
    somenteLeitura: false,
    rotas: [
      "/",
      "/configuracoes",
      "/instanciacao",
      "/instanciacao/resumo",
      "/auditoria",
      "/integracoes",
      "/integracoes/adaptador",
      "/notificacoes",
      "/alcadas",
      "/centros-de-custo",
    ],
  },
];

export const perfilPorEmail = (email: string) =>
  PERFIS.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());

type Ctx = {
  perfil: DefPerfil;
  perfilId: PerfilAcesso;
  setPerfil: (p: PerfilAcesso) => void;
  /** true quando o perfil não pode alterar dados (contador externo). */
  leitura: boolean;
  /** A rota está liberada para o perfil atual? */
  podeVer: (rota: string) => boolean;
};

const PerfilCtx = createContext<Ctx | null>(null);

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfilId, setPerfil] = useState<PerfilAcesso>("operador");
  const perfil = PERFIS.find((p) => p.id === perfilId) ?? PERFIS[0]!;

  const value = useMemo<Ctx>(
    () => ({
      perfil,
      perfilId,
      setPerfil,
      leitura: perfil.somenteLeitura,
      podeVer: (rota: string) => perfil.rotas === null || perfil.rotas.includes(rota),
    }),
    [perfil, perfilId],
  );

  return <PerfilCtx.Provider value={value}>{children}</PerfilCtx.Provider>;
}

export function usePerfil() {
  const ctx = useContext(PerfilCtx);
  if (!ctx) throw new Error("usePerfil deve ser usado dentro de PerfilProvider");
  return ctx;
}
