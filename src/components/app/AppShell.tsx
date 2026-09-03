import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { empresas } from "@/lib/mock-data";
import { CONSOLIDADO, useEmpresa } from "./EmpresaContext";
import { useFeatures, type Feature } from "./FeaturesContext";
import { PERFIS, usePerfil } from "./PerfilContext";

type ItemMenu = {
  to: string;
  icon: string;
  label: string;
  /** Só aparece quando a feature está ativa no tenant. */
  requer?: Feature;
};

type GrupoMenu = {
  titulo: string;
  itens: ItemMenu[];
  /** Grupo inteiro some quando a feature está desligada. */
  requer?: Feature;
};

const GRUPOS: GrupoMenu[] = [
  {
    titulo: "Operação",
    itens: [
      { to: "/", icon: "dashboard", label: "Dashboard" },
      { to: "/contas-a-receber", icon: "payments", label: "Contas a receber" },
      { to: "/contas-a-pagar", icon: "account_balance_wallet", label: "Contas a pagar" },
      { to: "/parceiros", icon: "groups", label: "Clientes e fornecedores" },
      { to: "/plano-de-contas", icon: "account_tree", label: "Plano de contas" },
      { to: "/relatorios", icon: "assessment", label: "Relatórios" },
    ],
  },
  {
    titulo: "Conciliação",
    requer: "conciliacao",
    itens: [
      { to: "/importar-extrato", icon: "upload_file", label: "Importar extrato" },
      { to: "/conciliacao", icon: "account_balance", label: "Conciliação bancária" },
    ],
  },
  {
    titulo: "Aprovações",
    requer: "alcada",
    itens: [
      { to: "/aprovacoes", icon: "how_to_reg", label: "Fila de aprovação" },
      { to: "/alcadas", icon: "speed", label: "Configurar alçada" },
    ],
  },
  {
    titulo: "Custos",
    requer: "centro_custo",
    itens: [
      { to: "/centros-de-custo", icon: "layers", label: "Centro de custo" },
      { to: "/rateio", icon: "call_split", label: "Rateio de título" },
    ],
  },
  {
    titulo: "Extensões",
    itens: [
      { to: "/comissoes", icon: "workspace_premium", label: "Comissões", requer: "mod_comissoes" },
    ],
  },
  {
    titulo: "Configurações",
    itens: [
      { to: "/exportacoes", icon: "file_download", label: "Exportar dados" },
      { to: "/notificacoes", icon: "notifications_active", label: "Notificações" },
      { to: "/integracoes", icon: "power", label: "Central de integrações", requer: "api_publica" },
      {
        to: "/integracoes/adaptador",
        icon: "tune",
        label: "Adaptador bancário",
        requer: "conciliacao",
      },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      { to: "/configuracoes", icon: "settings", label: "Features do tenant" },
      { to: "/instanciacao", icon: "auto_fix_high", label: "Assistente de instanciação" },
      { to: "/instanciacao/resumo", icon: "description", label: "Ficha de configuração" },
      { to: "/auditoria", icon: "history_edu", label: "Trilha de auditoria" },
    ],
  },
];

const linkBase =
  "flex items-center gap-3 px-4 py-2.5 rounded-lg font-label-md text-label-md cursor-pointer active:scale-95 transition-all duration-150";
const linkIdle = "text-on-primary-fixed-variant hover:text-on-primary hover:bg-primary-container";
// Sobre o azul escuro da sidebar o par legível do M3 e o tom "fixed" claro.
const linkActive = "text-secondary-fixed bg-on-primary-fixed-variant";

/** Menu lateral: reage às features do tenant e à lista branca do perfil. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { has } = useFeatures();
  const { podeVer, perfil } = usePerfil();

  const grupos = GRUPOS.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => (i.requer ? has(i.requer) : true)).filter((i) => podeVer(i.to)),
  }))
    .filter((g) => (g.requer ? has(g.requer) : true))
    .filter((g) => g.itens.length > 0);

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-outline-variant bg-primary px-md py-lg shadow-sm">
      <div className="mb-lg flex items-center gap-3 px-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary">
          <span className="material-symbols-outlined filled">account_balance</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-headline-sm text-headline-sm font-bold text-on-primary">
            FinCore ERP
          </h1>
          <p className="truncate font-body-sm text-body-sm text-on-primary-fixed-variant">
            {perfil.nome}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-lg">
        {grupos.map((g) => (
          <div key={g.titulo} className="flex flex-col gap-1">
            <p className="px-4 pb-1 font-label-md text-[10px] uppercase tracking-[0.14em] text-on-primary-fixed-variant/70">
              {g.titulo}
            </p>
            {g.itens.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={`${linkBase} ${linkIdle}`}
                activeProps={{ className: `${linkBase} ${linkActive}` }}
                activeOptions={{ exact: item.to === "/" }}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-lg">
        <Link
          to="/onboarding"
          onClick={onNavigate}
          className={`${linkBase} ${linkIdle}`}
          activeProps={{ className: `${linkBase} ${linkActive}` }}
        >
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          Onboarding
        </Link>
        <Link to="/auth" onClick={onNavigate} className={`${linkBase} ${linkIdle}`}>
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sair
        </Link>
      </div>
    </aside>
  );
}

/**
 * Seletor de empresa (PV7).
 *
 * Com `multiempresa` ativa é o controle de produto: troca entre os CNPJs do
 * grupo e abre a visão consolidada.
 *
 * Sem a feature, o controle de produto some — o tenant passa a ser um rótulo,
 * porque um cliente de CNPJ único não tem entre o que alternar. Como o
 * protótipo precisa demonstrar que cada tenant tem o seu conjunto de flags,
 * o alternador continua acessível, mas marcado como affordance de demonstração
 * (borda tracejada + selo "demo") para não se confundir com a feature.
 */
function SeletorEmpresa() {
  const { empresaId, setEmpresaId, nomeAtual } = useEmpresa();
  const { has } = useFeatures();
  const multi = has("multiempresa");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex w-full max-w-[11rem] items-center gap-2 rounded-lg border bg-surface px-3 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container sm:max-w-[15rem] lg:max-w-[19rem] ${
            multi ? "border-outline-variant" : "border-dashed border-outline-variant"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${multi ? "text-secondary" : "text-outline"}`}
          >
            domain
          </span>
          <span className="min-w-0 flex-1 truncate text-left">{nomeAtual}</span>
          {multi ? null : (
            <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant">
              demo
            </span>
          )}
          <span className="material-symbols-outlined text-[18px] text-outline">expand_more</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="font-label-md text-label-md">
          {multi ? "Empresas do grupo" : "Trocar de tenant (demonstração)"}
        </DropdownMenuLabel>
        {multi ? null : (
          <p className="px-2 pb-1.5 font-body-sm text-body-sm text-on-surface-variant">
            Este tenant não contrata <code className="font-data-mono">multiempresa</code>, então o
            seletor de empresas do produto está desativado (PV7). A troca abaixo existe só para
            demonstrar que cada tenant tem o seu conjunto de features.
          </p>
        )}
        {empresas.map((e) => (
          <DropdownMenuItem key={e.id} onSelect={() => setEmpresaId(e.id)} className="gap-2">
            <span
              className={`material-symbols-outlined text-[18px] text-secondary ${empresaId === e.id ? "opacity-100" : "opacity-0"}`}
            >
              check
            </span>
            <span className="flex flex-col">
              <span className="font-body-md text-body-md">{e.nome}</span>
              <span className="font-data-mono text-body-sm text-on-surface-variant">{e.cnpj}</span>
            </span>
          </DropdownMenuItem>
        ))}
        {multi ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setEmpresaId(CONSOLIDADO)} className="gap-2">
              <span
                className={`material-symbols-outlined text-[18px] text-secondary ${empresaId === CONSOLIDADO ? "opacity-100" : "opacity-0"}`}
              >
                check
              </span>
              <span className="font-label-md text-label-md">Visão consolidada do grupo</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Seletor de perfil de acesso no avatar do TopBar. */
function SeletorPerfil() {
  const { perfil, perfilId, setPerfil } = usePerfil();
  const { has } = useFeatures();
  const disponiveis = PERFIS.filter((p) => p.id !== "contador" || has("portal_contador"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface py-1 pl-1 pr-2 transition-colors hover:bg-surface-container">
          <span className="grid size-8 place-items-center rounded-full bg-primary-fixed font-label-md text-label-md text-primary">
            {perfil.iniciais}
          </span>
          <span className="material-symbols-outlined text-[18px] text-outline">expand_more</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-label-md text-label-md">
          Perfil de acesso
        </DropdownMenuLabel>
        {disponiveis.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setPerfil(p.id)} className="gap-2">
            <span
              className={`material-symbols-outlined text-[18px] text-secondary ${perfilId === p.id ? "opacity-100" : "opacity-0"}`}
            >
              check
            </span>
            <span className="flex flex-col">
              <span className="font-body-md text-body-md">
                {p.nome} · {p.usuario}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {p.descricao}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        {!has("portal_contador") ? (
          <>
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 font-body-sm text-body-sm text-on-surface-variant">
              O perfil <strong>Contador externo</strong> só aparece com a feature{" "}
              <code className="font-data-mono">portal_contador</code> ativa (PV4).
            </p>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar({
  tabs,
  actions,
  onAbrirMenu,
}: {
  tabs?: { label: string; active?: boolean }[];
  actions?: ReactNode;
  onAbrirMenu: () => void;
}) {
  const { perfil } = usePerfil();
  const { config } = useFeatures();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-md lg:px-lg">
      <div className="flex min-w-0 items-center gap-3 lg:gap-6">
        <button
          className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container lg:hidden"
          onClick={onAbrirMenu}
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="hidden font-headline-sm text-headline-sm text-primary sm:block">
          FinCore Financeiro
        </h2>
        <SeletorEmpresa />
        {tabs && tabs.length > 0 ? (
          <nav className="hidden gap-4 xl:flex">
            {tabs.map((t) => (
              <span
                key={t.label}
                className={
                  t.active
                    ? "cursor-pointer border-b-2 border-secondary pb-1 font-body-md text-body-md font-bold text-primary"
                    : "cursor-pointer font-body-md text-body-md text-on-surface-variant transition-colors duration-150 hover:text-secondary"
                }
              >
                {t.label}
              </span>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden xl:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-4 text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            placeholder="Buscar..."
            type="text"
          />
        </div>
        {actions}
        <span className="hidden rounded-full bg-surface-container px-3 py-1 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant lg:inline-flex">
          {config.perfilProduto}
        </span>
        <button className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary sm:block">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <span className="hidden text-right leading-tight lg:block">
          <span className="block font-label-md text-label-md text-on-surface">
            {perfil.usuario}
          </span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant">
            {perfil.nome}
          </span>
        </span>
        <SeletorPerfil />
      </div>
    </header>
  );
}

/** Banner exibido em todas as telas quando o perfil é somente leitura (PV4). */
export function BannerSomenteLeitura() {
  const { leitura, perfil } = usePerfil();
  if (!leitura) return null;
  return (
    <div className="mb-md flex items-start gap-3 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 p-3">
      <span className="material-symbols-outlined text-primary">visibility</span>
      <div>
        <p className="font-label-md text-label-md text-primary">Acesso somente leitura</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          O perfil <strong>{perfil.nome}</strong> ({perfil.usuario}) visualiza listagens,
          conciliação e exportações. Ações de criar, editar e inativar ficam ocultas.
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Telas de tela cheia, sem o shell administrativo.
  if (pathname === "/auth" || pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background font-body-md text-on-background">
      {aberto ? (
        <div
          className="fixed inset-0 z-40 bg-primary/50 lg:hidden"
          onClick={() => setAberto(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setAberto(false)} />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar onAbrirMenu={() => setAberto(true)} />
        <main className="flex-1 overflow-x-hidden bg-surface-container-low p-md md:p-margin">
          <BannerSomenteLeitura />
          {children}
        </main>
      </div>
    </div>
  );
}
