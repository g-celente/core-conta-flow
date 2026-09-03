import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bell,
  BellRing,
  Building2,
  Check,
  ChevronDown,
  Eye,
  FileDown,
  FileSpreadsheet,
  Gauge,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PlugZap,
  Receipt,
  Rocket,
  ScrollText,
  Settings,
  ShieldCheck,
  Sliders,
  Split,
  Upload,
  Users,
  Wallet,
  Wand2,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { empresas } from "@/lib/mock-data";
import { CONSOLIDADO, useEmpresa } from "./EmpresaContext";
import { useFeatures, type Feature } from "./FeaturesContext";
import { PERFIS, usePerfil } from "./PerfilContext";

type ItemMenu = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
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
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/contas-a-receber", label: "Contas a receber", icon: Receipt },
      { to: "/contas-a-pagar", label: "Contas a pagar", icon: Wallet },
      { to: "/parceiros", label: "Clientes e fornecedores", icon: Users },
      { to: "/plano-de-contas", label: "Plano de contas", icon: Workflow },
      { to: "/relatorios", label: "Relatórios", icon: FileSpreadsheet },
    ],
  },
  {
    titulo: "Conciliação",
    requer: "conciliacao",
    itens: [
      { to: "/importar-extrato", label: "Importar extrato", icon: Upload },
      { to: "/conciliacao", label: "Conciliação bancária", icon: ArrowLeftRight },
    ],
  },
  {
    titulo: "Aprovações",
    requer: "alcada",
    itens: [
      { to: "/aprovacoes", label: "Fila de aprovação", icon: ShieldCheck },
      { to: "/alcadas", label: "Configurar alçada", icon: Gauge },
    ],
  },
  {
    titulo: "Custos",
    requer: "centro_custo",
    itens: [
      { to: "/centros-de-custo", label: "Centro de custo", icon: Layers },
      { to: "/rateio", label: "Rateio de título", icon: Split },
    ],
  },
  {
    titulo: "Extensões",
    itens: [{ to: "/comissoes", label: "Comissões", icon: Wand2, requer: "mod_comissoes" }],
  },
  {
    titulo: "Configurações",
    itens: [
      { to: "/exportacoes", label: "Exportar dados", icon: FileDown },
      { to: "/notificacoes", label: "Notificações", icon: BellRing },
      { to: "/integracoes", label: "Central de integrações", icon: PlugZap, requer: "api_publica" },
      {
        to: "/integracoes/adaptador",
        label: "Adaptador bancário",
        icon: Sliders,
        requer: "conciliacao",
      },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      { to: "/configuracoes", label: "Features do tenant", icon: Settings },
      { to: "/instanciacao", label: "Assistente de instanciação", icon: Wand2 },
      { to: "/instanciacao/resumo", label: "Ficha de configuração", icon: ScrollText },
      { to: "/auditoria", label: "Trilha de auditoria", icon: ScrollText },
    ],
  },
];

const linkCls =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

/** Menu lateral: reage às features do tenant e à lista branca do perfil. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { has } = useFeatures();
  const { podeVer } = usePerfil();

  const grupos = GRUPOS.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => (i.requer ? has(i.requer) : true)).filter((i) => podeVer(i.to)),
  }))
    .filter((g) => (g.requer ? has(g.requer) : true))
    .filter((g) => g.itens.length > 0);

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {grupos.map((g) => (
        <div key={g.titulo}>
          <p className="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/50">
            {g.titulo}
          </p>
          <ul className="space-y-0.5">
            {g.itens.map((item) => {
              const ativo = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      linkCls,
                      ativo &&
                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]",
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="border-t border-sidebar-border pt-4">
        <ul className="space-y-0.5">
          <li>
            <Link to="/onboarding" onClick={onNavigate} className={linkCls}>
              <Rocket className="size-4 shrink-0 opacity-80" />
              <span className="truncate">Onboarding</span>
            </Link>
          </li>
          <li>
            <Link to="/auth" onClick={onNavigate} className={linkCls}>
              <LogOut className="size-4 shrink-0 opacity-80" />
              <span className="truncate">Sair</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/**
 * Seletor de empresa (PV7).
 *
 * Com `multiempresa` ativa é o controle de produto: troca entre os CNPJs do
 * grupo e abre a visão consolidada.
 *
 * Sem a feature, o controle de produto some — um cliente de CNPJ único não tem
 * entre o que alternar. Como o protótipo precisa demonstrar que cada tenant tem
 * o seu conjunto de flags, o alternador continua acessível, mas marcado como
 * affordance de demonstração (borda tracejada + selo "demo").
 */
function SeletorEmpresa() {
  const { empresaId, setEmpresaId, nomeAtual } = useEmpresa();
  const { has } = useFeatures();
  const multi = has("multiempresa");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "max-w-[11rem] justify-between gap-2 sm:max-w-[15rem] lg:max-w-sm",
            !multi && "border-dashed",
          )}
        >
          <Building2 className={cn("size-4 shrink-0", multi ? "text-primary" : "opacity-60")} />
          <span className="min-w-0 flex-1 truncate text-left text-sm">{nomeAtual}</span>
          {multi ? null : (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
              demo
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>
          {multi ? "Empresas do grupo" : "Trocar de tenant (demonstração)"}
        </DropdownMenuLabel>
        {multi ? null : (
          <p className="px-2 pb-1.5 text-xs text-muted-foreground">
            Este tenant não contrata <code className="num">multiempresa</code>, então o seletor de
            empresas do produto está desativado (PV7). A troca abaixo existe só para demonstrar que
            cada tenant tem o seu conjunto de features.
          </p>
        )}
        {empresas.map((e) => (
          <DropdownMenuItem key={e.id} onSelect={() => setEmpresaId(e.id)} className="gap-2">
            <Check className={cn("size-4", empresaId === e.id ? "opacity-100" : "opacity-0")} />
            <span className="flex flex-col">
              <span className="text-sm">{e.nome}</span>
              <span className="num text-xs text-muted-foreground">{e.cnpj}</span>
            </span>
          </DropdownMenuItem>
        ))}
        {multi ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setEmpresaId(CONSOLIDADO)} className="gap-2">
              <Check
                className={cn("size-4", empresaId === CONSOLIDADO ? "opacity-100" : "opacity-0")}
              />
              <span className="text-sm font-semibold">Visão consolidada do grupo</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Seletor de perfil de acesso no avatar do topo. */
function SeletorPerfil() {
  const { perfil, perfilId, setPerfil } = usePerfil();
  const { has } = useFeatures();
  const disponiveis = PERFIS.filter((p) => p.id !== "contador" || has("portal_contador"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border p-1 pr-2 transition-colors hover:bg-accent">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {perfil.iniciais}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Perfil de acesso</DropdownMenuLabel>
        {disponiveis.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setPerfil(p.id)} className="gap-2">
            <Check
              className={cn("size-4 shrink-0", perfilId === p.id ? "opacity-100" : "opacity-0")}
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm">
                {p.nome} · {p.usuario}
              </span>
              <span className="text-xs text-muted-foreground">{p.descricao}</span>
            </span>
          </DropdownMenuItem>
        ))}
        {!has("portal_contador") ? (
          <>
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              O perfil <strong>Contador externo</strong> só aparece com a feature{" "}
              <code className="num">portal_contador</code> ativa (PV4).
            </p>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Banner exibido em todas as telas quando o perfil é somente leitura (PV4). */
export function BannerSomenteLeitura() {
  const { leitura, perfil } = usePerfil();
  if (!leitura) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/8 p-3">
      <Eye className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-semibold text-foreground">Acesso somente leitura</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
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
  const { perfil } = usePerfil();
  const { config } = useFeatures();

  // Telas de tela cheia, sem o shell administrativo.
  if (pathname === "/auth" || pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {aberto ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setAberto(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          aberto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground">
              F
            </span>
            <span className="truncate text-base font-extrabold tracking-tight text-sidebar-accent-foreground">
              FinCore
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setAberto(false)} aria-label="Fechar menu">
            <X className="size-5 text-sidebar-foreground" />
          </button>
        </div>
        <SidebarNav onNavigate={() => setAberto(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setAberto(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <SeletorEmpresa />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-border bg-muted px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground lg:inline-flex">
              {config.perfilProduto}
            </span>
            <button
              className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:block"
              aria-label="Notificações"
            >
              <Bell className="size-4" />
            </button>
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-semibold">{perfil.usuario}</span>
              <span className="block text-muted-foreground">{perfil.nome}</span>
            </span>
            <SeletorPerfil />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[92rem] flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <BannerSomenteLeitura />
          {children}
        </main>
      </div>
    </div>
  );
}
