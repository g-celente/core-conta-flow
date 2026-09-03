import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Gauge,
  LayoutDashboard,
  Layers,
  Menu,
  PlugZap,
  Bell,
  ScrollText,
  ShieldCheck,
  Sliders,
  Split,
  Upload,
  Wand2,
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

const grupos = [
  {
    titulo: "Visão geral",
    itens: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    titulo: "Conciliação",
    itens: [
      { to: "/importar-extrato", label: "Importar extrato", icon: Upload },
      { to: "/conciliacao", label: "Conciliação bancária", icon: ArrowLeftRight },
    ],
  },
  {
    titulo: "Aprovações",
    itens: [
      { to: "/aprovacoes", label: "Fila de aprovação", icon: ShieldCheck },
      { to: "/alcadas", label: "Configurar alçada", icon: Gauge },
    ],
  },
  {
    titulo: "Custos",
    itens: [
      { to: "/centros-de-custo", label: "Centro de custo", icon: Layers },
      { to: "/rateio", label: "Rateio de título", icon: Split },
    ],
  },
  {
    titulo: "Configurações",
    itens: [
      { to: "/exportacoes", label: "Exportar dados", icon: FileSpreadsheet },
      { to: "/notificacoes", label: "Notificações", icon: Bell },
      { to: "/integracoes", label: "Central de integrações", icon: PlugZap },
      { to: "/integracoes/adaptador", label: "Adaptador de integração", icon: Sliders },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      { to: "/instanciacao", label: "Assistente de instanciação", icon: Wand2 },
      { to: "/instanciacao/resumo", label: "Ficha de configuração", icon: ScrollText },
      { to: "/auditoria", label: "Trilha de auditoria", icon: ScrollText },
    ],
  },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
    </nav>
  );
}

function SeletorEmpresa() {
  const { empresaId, setEmpresaId, nomeAtual } = useEmpresa();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-[15rem] justify-between gap-2 sm:max-w-sm">
          <Building2 className="size-4 shrink-0 text-primary" />
          <span className="truncate text-sm">{nomeAtual}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Empresas do grupo</DropdownMenuLabel>
        {empresas.map((e) => (
          <DropdownMenuItem key={e.id} onSelect={() => setEmpresaId(e.id)} className="gap-2">
            <Check className={cn("size-4", empresaId === e.id ? "opacity-100" : "opacity-0")} />
            <span className="flex flex-col">
              <span className="text-sm">{e.nome}</span>
              <span className="num text-xs text-muted-foreground">{e.cnpj}</span>
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setEmpresaId(CONSOLIDADO)} className="gap-2">
          <Check
            className={cn("size-4", empresaId === CONSOLIDADO ? "opacity-100" : "opacity-0")}
          />
          <span className="text-sm font-semibold">Visão consolidada do grupo</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
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
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground">
              F
            </span>
            <span className="text-base font-extrabold tracking-tight text-sidebar-accent-foreground">
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
          <button
            className="lg:hidden"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <SeletorEmpresa />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-semibold">Ana Paula Ribeiro</span>
              <span className="block text-muted-foreground">Financeiro · Operador</span>
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              AR
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
