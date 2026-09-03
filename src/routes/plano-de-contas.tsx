import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Ban, ChevronDown, CornerDownRight, Pencil, Plus, PlusCircle, Search } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl, contasPorRegime, planoDeContas, type ContaPlano } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plano-de-contas")({
  head: () => ({
    meta: [
      { title: "Plano de contas — FinCore" },
      {
        name: "description",
        content: "Estrutura hierárquica contábil e gerencial com contas sintéticas e analíticas.",
      },
      { property: "og:title", content: "Plano de contas — FinCore" },
      {
        property: "og:description",
        content: "Árvore de contas sugerida conforme o regime tributário do tenant.",
      },
    ],
  }),
  component: PlanoDeContas,
});

const GRUPOS = ["Ativo", "Passivo", "Receitas", "Despesas"] as const;

const corGrupo: Record<string, string> = {
  Ativo: "bg-chart-4",
  Passivo: "bg-chart-3",
  Receitas: "bg-success",
  Despesas: "bg-destructive",
};

function PlanoDeContas() {
  const { leitura } = usePerfil();
  const { config } = useFeatures();

  const [busca, setBusca] = useState("");
  const [colapsados, setColapsados] = useState<string[]>([]);
  const [soAnaliticas, setSoAnaliticas] = useState(false);

  /** PV1: as contas tributárias do regime do tenant entram na árvore. */
  const extras = contasPorRegime[config.regime] ?? [];

  const todas = useMemo<ContaPlano[]>(
    () => [...planoDeContas, ...extras].sort((a, b) => a.codigo.localeCompare(b.codigo)),
    [extras],
  );

  const raizDe = (codigo: string) => codigo.split(".")[0] ?? "";

  const visiveis = useMemo(
    () =>
      todas.filter((c) => {
        if (busca && !`${c.codigo} ${c.descricao}`.toLowerCase().includes(busca.toLowerCase()))
          return false;
        if (soAnaliticas && c.tipo !== "ANALÍTICA") return false;
        if (!busca && c.nivel > 0 && colapsados.includes(raizDe(c.codigo))) return false;
        return true;
      }),
    [todas, busca, soAnaliticas, colapsados],
  );

  const alternarGrupo = (raiz: string) =>
    setColapsados((l) => (l.includes(raiz) ? l.filter((x) => x !== raiz) : [...l, raiz]));

  const totais = GRUPOS.map((g) => ({
    grupo: g,
    total: todas.filter((c) => c.grupo === g && c.nivel === 0).reduce((s, c) => s + c.saldo, 0),
    qtd: todas.filter((c) => c.grupo === g).length,
  }));

  return (
    <>
      <PageHeader
        titulo="Plano de contas"
        descricao={`Estrutura hierárquica contábil e gerencial · regime ${config.regime}.`}
        variabilidade={[
          {
            o_que: `As contas tributárias mudam com o regime: ${config.regime} adiciona ${extras.length} conta(s) específica(s).`,
            por: "regime tributário do tenant",
            pv: "PV1",
          },
          {
            o_que: "Ações de nova conta, editar e inativar somem no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que: "Contas de rateio gerencial só fazem sentido com centro de custo contratado.",
            por: "feature centro_custo",
            pv: "PV7",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button
              className="gap-1.5"
              onClick={() =>
                toast.success("Nova conta analítica criada", {
                  description: "No protótipo a conta é adicionada apenas à sessão atual.",
                })
              }
            >
              <PlusCircle className="size-4" /> Nova conta
            </Button>
          )
        }
      />

      {/* Totais por grupo */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {totais.map((t) => (
          <Card key={t.grupo} className="shadow-card">
            <CardContent className="pt-6">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className={cn("size-2.5 rounded-sm", corGrupo[t.grupo])} />
                {t.grupo}
              </p>
              <p className="num text-lg font-bold">{brl(t.total)}</p>
              <p className="text-xs text-muted-foreground">{t.qtd} contas</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-semibold text-muted-foreground">
                {visiveis.length} contas exibidas
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={soAnaliticas}
                  onChange={(e) => setSoAnaliticas(e.target.checked)}
                  className="size-4 rounded accent-[var(--primary)]"
                />
                Só analíticas
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar conta ou código..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => setColapsados([])}>
                Expandir tudo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setColapsados(["1", "2", "3", "4"])}
              >
                Colapsar tudo
              </Button>
            </div>
          </div>

          {/* Cabeçalho */}
          <div className="hidden items-center border-b border-border px-3 py-2 md:flex">
            <div className="w-8 shrink-0" />
            <div className="w-32 shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Código
            </div>
            <div className="flex-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Descrição da conta
            </div>
            <div className="w-28 shrink-0 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Tipo
            </div>
            <div className="w-40 shrink-0 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Saldo atual
            </div>
            <div className="w-24 shrink-0" />
          </div>

          <div className="flex flex-col divide-y divide-border">
            {visiveis.map((c) => {
              const sintetica = c.tipo === "SINTÉTICA";
              const raiz = raizDe(c.codigo);
              const colapsado = colapsados.includes(raiz);
              const doRegime = extras.some((x) => x.codigo === c.codigo);
              return (
                <div
                  key={c.codigo}
                  className="group relative flex flex-wrap items-center gap-y-1 py-2.5 pr-3 transition-colors hover:bg-muted/40 md:flex-nowrap"
                  style={{ paddingLeft: `${12 + c.nivel * 24}px` }}
                >
                  {c.nivel === 0 ? (
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 w-1 rounded-r opacity-70",
                        corGrupo[c.grupo],
                      )}
                    />
                  ) : null}

                  {c.nivel === 0 ? (
                    <button
                      type="button"
                      onClick={() => alternarGrupo(raiz)}
                      aria-label={colapsado ? "Expandir grupo" : "Colapsar grupo"}
                      className="grid w-8 shrink-0 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform", colapsado && "-rotate-90")}
                      />
                    </button>
                  ) : (
                    <span className="grid w-8 shrink-0 place-items-center">
                      {sintetica ? (
                        <CornerDownRight className="size-3.5 text-primary" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-border" />
                      )}
                    </span>
                  )}

                  <span
                    className={cn(
                      "num w-32 shrink-0 text-sm",
                      sintetica ? "font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {c.codigo}
                  </span>

                  <span className={cn("min-w-0 flex-1 pr-3 text-sm", sintetica && "font-semibold")}>
                    {c.descricao}
                    {doRegime ? (
                      <StatusBadge tone="info" className="ml-2">
                        {config.regime} · PV1
                      </StatusBadge>
                    ) : null}
                  </span>

                  <span className="w-28 shrink-0 text-center">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-0.5 text-[0.65rem] font-bold tracking-wide",
                        sintetica
                          ? "bg-muted text-muted-foreground"
                          : "border border-border text-muted-foreground",
                      )}
                    >
                      {c.tipo}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "num w-40 shrink-0 text-right text-sm",
                      sintetica && "font-semibold",
                    )}
                  >
                    {brl(c.saldo)}
                  </span>

                  <span className="flex w-24 shrink-0 items-center justify-end gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    {leitura ? null : (
                      <>
                        {sintetica ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Incluir subconta"
                            onClick={() => toast.success(`Subconta criada sob ${c.codigo}`)}
                          >
                            <Plus className="size-4" />
                          </Button>
                        ) : null}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => toast.info(`Editando conta ${c.codigo}`)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {!sintetica ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Inativar"
                            className="hover:text-destructive"
                            onClick={() =>
                              toast.warning(`Conta ${c.codigo} inativada`, {
                                description: "Contas com saldo não podem ser excluídas.",
                              })
                            }
                          >
                            <Ban className="size-4" />
                          </Button>
                        ) : null}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
            {visiveis.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma conta encontrada.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
