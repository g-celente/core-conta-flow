import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  FolderTree,
  Landmark,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures, type Regime } from "@/components/app/FeaturesContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, contasPorRegime, planoDeContas } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — FinCore" },
      {
        name: "description",
        content:
          "Configure empresa, plano de contas sugerido por regime e a primeira conta bancária.",
      },
      { property: "og:title", content: "Onboarding — FinCore" },
      {
        property: "og:description",
        content: "Assistente de três passos para inicializar o ambiente do tenant.",
      },
    ],
  }),
  component: OnboardingPage,
});

const REGIMES: Regime[] = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];

const BANCOS = [
  "001 — Banco do Brasil S.A.",
  "033 — Banco Santander (Brasil) S.A.",
  "104 — Caixa Econômica Federal",
  "237 — Banco Bradesco S.A.",
  "341 — Itaú Unibanco S.A.",
];

const PASSOS = ["Empresa", "Plano de contas", "Banco"] as const;

function OnboardingPage() {
  const router = useRouter();
  const { config, setRegime } = useFeatures();
  const { registrar } = useAuditoria();
  const { perfil } = usePerfil();
  const { nomeAtual } = useEmpresa();

  const [passo, setPasso] = useState(0);
  const [empresa, setEmpresa] = useState({
    razaoSocial: "",
    cnpj: "",
    regime: config.regime as Regime,
  });
  const [planoAplicado, setPlanoAplicado] = useState(false);
  const [busca, setBusca] = useState("");
  const [banco, setBanco] = useState({ instituicao: "", agencia: "", conta: "" });

  /** PV1: o plano sugerido muda conforme o regime tributário escolhido. */
  const contasSugeridas = useMemo(() => {
    const extras = contasPorRegime[empresa.regime] ?? [];
    return [...planoDeContas.filter((c) => c.nivel <= 2), ...extras].filter((c) =>
      `${c.codigo} ${c.descricao}`.toLowerCase().includes(busca.toLowerCase()),
    );
  }, [empresa.regime, busca]);

  const extrasDoRegime = contasPorRegime[empresa.regime] ?? [];

  const passo1Ok = empresa.razaoSocial.trim().length > 2 && empresa.cnpj.trim().length >= 14;
  const passo3Ok = banco.instituicao !== "" && banco.agencia !== "" && banco.conta !== "";
  const podeAvancar = passo === 0 ? passo1Ok : passo === 1 ? planoAplicado : passo3Ok;

  const avancar = () => {
    if (passo < 2) {
      if (passo === 0) setRegime(empresa.regime);
      setPasso((p) => p + 1);
      return;
    }
    registrar({
      tipo: "feature",
      entidade: "Onboarding",
      operacao: "Concluído",
      detalhe: `Regime ${empresa.regime} · ${contasSugeridas.length} contas aplicadas · banco ${banco.instituicao}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Ambiente configurado", {
      description: "Empresa, plano de contas e conta bancária cadastrados.",
    });
    void router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-center border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">
            F
          </span>
          <span className="text-base font-extrabold tracking-tight">FinCore ERP</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-10 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold sm:text-[1.7rem]">Bem-vindo ao FinCore</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vamos configurar seu ambiente em poucos passos.
          </p>
        </div>

        {/* Indicador */}
        <div className="relative mb-8 w-full max-w-2xl">
          <div className="absolute left-[16%] right-[16%] top-5 -z-10 h-0.5 rounded-full bg-border" />
          <div className="relative flex justify-between">
            {PASSOS.map((nome, i) => {
              const feito = i < passo;
              const ativo = i === passo;
              return (
                <div key={nome} className="flex flex-col items-center gap-2 bg-background px-3">
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-full text-sm font-bold transition-colors",
                      feito && "bg-success text-success-foreground",
                      ativo && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !feito && !ativo && "border-2 border-border bg-card text-muted-foreground",
                    )}
                  >
                    {feito ? <Check className="size-5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-center text-xs font-semibold",
                      ativo ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {nome}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-[480px] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {passo === 0 ? (
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              <div>
                <h2 className="text-lg font-bold">Dados da empresa</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe os dados fiscais básicos para inicializar o sistema.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="razao">Razão social</Label>
                  <Input
                    id="razao"
                    placeholder="Ex.: Acme Tecnologia Ltda"
                    value={empresa.razaoSocial}
                    onChange={(e) => setEmpresa((s) => ({ ...s, razaoSocial: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    className="num"
                    placeholder="00.000.000/0001-00"
                    value={empresa.cnpj}
                    onChange={(e) => setEmpresa((s) => ({ ...s, cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="regime">
                    Regime tributário <span className="text-primary">(PV1)</span>
                  </Label>
                  <Select
                    value={empresa.regime}
                    onValueChange={(v) => {
                      setEmpresa((s) => ({ ...s, regime: v as Regime }));
                      setPlanoAplicado(false);
                    }}
                  >
                    <SelectTrigger id="regime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-auto flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/8 p-4">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  O regime escolhido é o <strong>ponto de variação PV1</strong>: ele define quais
                  contas tributárias entram no plano sugerido no próximo passo.
                </p>
              </div>
            </div>
          ) : null}

          {passo === 1 ? (
            <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div>
                  <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                    Plano de contas
                    <StatusBadge tone="info">Recomendado</StatusBadge>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sugerimos esta estrutura inicial com base no regime{" "}
                    <strong>{empresa.regime}</strong>
                    {extrasDoRegime.length > 0
                      ? ` — inclui ${extrasDoRegime.length} conta(s) tributária(s) específica(s) deste regime.`
                      : "."}
                  </p>
                </div>
                <Button
                  className="shrink-0 gap-1.5"
                  variant={planoAplicado ? "secondary" : "default"}
                  onClick={() => {
                    setPlanoAplicado(true);
                    toast.success(`${contasSugeridas.length} contas aplicadas ao plano`);
                  }}
                >
                  {planoAplicado ? <Check className="size-4" /> : <FolderTree className="size-4" />}
                  {planoAplicado ? "Plano aplicado" : "Aplicar plano sugerido"}
                </Button>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border">
                <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Buscar conta..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="max-h-[280px] flex-1 overflow-y-auto p-2">
                  <div className="flex flex-col gap-0.5">
                    {contasSugeridas.map((c) => {
                      const sintetica = c.tipo === "SINTÉTICA";
                      const doRegime = extrasDoRegime.some((x) => x.codigo === c.codigo);
                      return (
                        <div
                          key={c.codigo}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60",
                            doRegime && "bg-primary/8",
                          )}
                          style={{ paddingLeft: `${8 + c.nivel * 20}px` }}
                        >
                          {sintetica ? (
                            <FolderTree className="size-4 shrink-0 text-primary" />
                          ) : (
                            <FileText className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="num w-24 shrink-0 text-xs text-muted-foreground">
                            {c.codigo}
                          </span>
                          <span className={cn("text-sm", sintetica && "font-semibold")}>
                            {c.descricao}
                          </span>
                          {doRegime ? (
                            <StatusBadge tone="info" className="ml-auto shrink-0">
                              {empresa.regime}
                            </StatusBadge>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {passo === 2 ? (
            <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
              <div>
                <h2 className="text-lg font-bold">Primeira conta bancária</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione a conta principal para iniciar a conciliação. O adaptador de arquivo
                  configurado para este tenant é <strong className="num">{config.adaptador}</strong>{" "}
                  (PV2).
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-3">
                  <Label htmlFor="inst">Instituição financeira</Label>
                  <Select
                    value={banco.instituicao}
                    onValueChange={(v) => setBanco((s) => ({ ...s, instituicao: v }))}
                  >
                    <SelectTrigger id="inst">
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANCOS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ag">Agência</Label>
                  <Input
                    id="ag"
                    className="num"
                    placeholder="0000"
                    value={banco.agencia}
                    onChange={(e) => setBanco((s) => ({ ...s, agencia: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="cc">Conta com dígito</Label>
                  <Input
                    id="cc"
                    className="num"
                    placeholder="00000-0"
                    value={banco.conta}
                    onChange={(e) => setBanco((s) => ({ ...s, conta: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-auto grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Empresa
                  </p>
                  <p className="text-sm">{empresa.razaoSocial || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Regime
                  </p>
                  <p className="text-sm">{empresa.regime}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contas no plano
                  </p>
                  <p className="num text-sm">
                    {contasSugeridas.length} ·{" "}
                    {brl(contasSugeridas.reduce((s, c) => s + c.saldo, 0))}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4 sm:px-8">
            <Button
              variant="ghost"
              disabled={passo === 0}
              onClick={() => setPasso((p) => Math.max(0, p - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="size-4" /> Voltar
            </Button>
            <Button disabled={!podeAvancar} onClick={avancar} className="gap-1.5">
              {passo === 2 ? "Concluir configuração" : "Próximo passo"}
              {passo === 2 ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          Seus dados estão seguros e criptografados.
        </p>
      </main>
    </div>
  );
}
