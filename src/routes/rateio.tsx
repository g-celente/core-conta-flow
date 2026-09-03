import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Plus, Save, ToggleLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, centrosDeCusto, type RateioLinha } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rateio")({
  head: () => ({
    meta: [
      { title: "Rateio de título — FinCore" },
      {
        name: "description",
        content: "Distribua o valor de um título entre centros de custo validando a soma de 100%.",
      },
      { property: "og:title", content: "Rateio de título — FinCore" },
      { property: "og:description", content: "Rateio por centro de custo com validação de 100%." },
    ],
  }),
  component: Rateio,
});

function Rateio() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos, editarTitulo } = useDados();

  const elegiveis = titulos.filter((t) => t.status !== "Cancelado");
  const [tituloId, setTituloId] = useState(elegiveis[0]?.id ?? "");
  const titulo = titulos.find((t) => t.id === tituloId);
  const [linhas, setLinhas] = useState<RateioLinha[]>(titulo?.rateio ?? []);

  useEffect(() => {
    setLinhas(titulo?.rateio ?? [{ centroId: centrosDeCusto[0]!.id, percentual: 100 }]);
  }, [titulo]);

  if (!has("centro_custo")) {
    return (
      <>
        <PageHeader
          titulo="Rateio de título"
          descricao="Distribuição do valor de um título entre centros de custo."
          variabilidade={[
            {
              o_que: "A tela e o grupo Custos no menu só existem com a feature centro_custo.",
              por: "feature centro_custo",
              pv: "PV7",
            },
          ]}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Centro de custo não contratado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ative a feature <code className="num">centro_custo</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV7) para ratear títulos.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const soma = linhas.reduce((s, l) => s + (Number(l.percentual) || 0), 0);
  const ok = soma === 100;
  const valor = titulo?.valor ?? 0;

  const distribuirIgualmente = () => {
    const base = Math.floor(100 / linhas.length);
    const resto = 100 - base * linhas.length;
    setLinhas((l) => l.map((x, i) => ({ ...x, percentual: base + (i === 0 ? resto : 0) })));
  };

  const usarPadrao = () =>
    setLinhas(centrosDeCusto.map((c) => ({ centroId: c.id, percentual: c.rateio })));

  const salvar = () => {
    if (!titulo || !ok) return;
    editarTitulo(
      titulo.id,
      {
        documento: titulo.documento,
        parceiroId: titulo.parceiroId,
        fornecedor: titulo.fornecedor,
        categoria: titulo.categoria,
        vencimento: titulo.vencimento,
        valor: titulo.valor,
        rateio: linhas.map((l) => ({ ...l, percentual: Number(l.percentual) })),
        ...(titulo.parcela ? { parcela: titulo.parcela } : {}),
        ...(titulo.recorrencia ? { recorrencia: titulo.recorrencia } : {}),
      },
      perfil.usuario,
    );
    registrar({
      tipo: "crud",
      entidade: "Rateio",
      operacao: "Salvar",
      detalhe: `${titulo.documento} rateado em ${linhas.length} centro(s): ${linhas
        .map((l) => `${centrosDeCusto.find((c) => c.id === l.centroId)?.codigo} ${l.percentual}%`)
        .join(" · ")}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Rateio salvo", { description: `${titulo.documento} · soma 100% validada.` });
  };

  return (
    <>
      <PageHeader
        titulo="Rateio de título"
        descricao="Distribua o valor entre centros de custo. O rateio só pode ser salvo quando a soma é exatamente 100%."
        variabilidade={[
          {
            o_que:
              "A tela e o grupo Custos no menu só existem com a feature centro_custo contratada.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "A lista de títulos elegíveis vem do tenant selecionado no topo.",
            por: "seletor de empresa",
            pv: "PV7",
          },
          {
            o_que: "O botão Salvar rateio fica oculto no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          <StatusBadge tone={ok ? "success" : "danger"}>Soma atual: {soma}% de 100%</StatusBadge>
        }
      />

      {elegiveis.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nenhum título disponível para rateio.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Card className="shadow-card">
              <CardContent className="space-y-1.5 pt-6">
                <Label htmlFor="r-titulo">Título a ratear</Label>
                <Select value={tituloId} onValueChange={setTituloId}>
                  <SelectTrigger id="r-titulo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {elegiveis.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.documento} · {brl(t.valor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {titulo ? (
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Título selecionado
                  </p>
                  <p className="mt-1 font-semibold">{titulo.fornecedor}</p>
                  <p className="num text-xs text-muted-foreground">
                    {titulo.documento} · venc. {titulo.vencimento}
                  </p>
                  <p className="num mt-3 text-2xl font-bold">{brl(titulo.valor)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {titulo.categoria} · {titulo.status}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Atalhos</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start" onClick={distribuirIgualmente}>
                  Distribuir igualmente entre as linhas
                </Button>
                <Button variant="outline" className="justify-start" onClick={usarPadrao}>
                  Usar o rateio padrão dos centros
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card xl:col-span-2">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Distribuição por centro de custo</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-dashed"
                disabled={linhas.length >= centrosDeCusto.length}
                onClick={() =>
                  setLinhas((l) => [
                    ...l,
                    {
                      centroId:
                        centrosDeCusto.find((c) => !l.some((x) => x.centroId === c.id))?.id ??
                        centrosDeCusto[0]!.id,
                      percentual: 0,
                    },
                  ])
                }
              >
                <Plus className="size-3.5" /> Adicionar centro
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col divide-y divide-border">
                {linhas.map((l, i) => {
                  const centro = centrosDeCusto.find((c) => c.id === l.centroId);
                  return (
                    <div key={i} className="flex flex-wrap items-center gap-3 py-3">
                      <Select
                        value={l.centroId}
                        onValueChange={(v) =>
                          setLinhas((s) =>
                            s.map((x, idx) => (idx === i ? { ...x, centroId: v } : x)),
                          )
                        }
                      >
                        <SelectTrigger className="min-w-0 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {centrosDeCusto.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.codigo} — {c.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={l.percentual}
                          onChange={(e) =>
                            setLinhas((s) =>
                              s.map((x, idx) =>
                                idx === i ? { ...x, percentual: Number(e.target.value) } : x,
                              ),
                            )
                          }
                          className="w-24 accent-[var(--primary)] sm:w-32"
                          aria-label={`Percentual de ${centro?.descricao ?? ""}`}
                        />
                        <div className="relative w-24">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="num pr-7"
                            value={l.percentual}
                            onChange={(e) =>
                              setLinhas((s) =>
                                s.map((x, idx) =>
                                  idx === i ? { ...x, percentual: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                          <span className="num pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>

                      <span className="num w-28 text-right text-sm">
                        {brl((valor * (Number(l.percentual) || 0)) / 100)}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Remover linha"
                        disabled={linhas.length === 1}
                        className="hover:text-destructive"
                        onClick={() => setLinhas((s) => s.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Validação da soma
                  </span>
                  <span className={cn("num font-bold", ok ? "text-success" : "text-destructive")}>
                    {soma}% · {brl((valor * soma) / 100)} de {brl(valor)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      ok ? "bg-success" : soma > 100 ? "bg-destructive" : "bg-warning",
                    )}
                    style={{ width: `${Math.min(soma, 100)}%` }}
                  />
                </div>
                {ok ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 className="size-3.5" />
                    Soma válida — o rateio pode ser salvo.
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5" />
                    {soma > 100
                      ? `Reduza ${soma - 100}% para fechar em 100%.`
                      : `Faltam ${100 - soma}% para fechar em 100%.`}
                  </p>
                )}
              </div>

              {leitura ? null : (
                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setLinhas(titulo?.rateio ?? [])}>
                    Descartar alterações
                  </Button>
                  <Button disabled={!ok} onClick={salvar} className="gap-1.5">
                    <Save className="size-4" /> Salvar rateio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
