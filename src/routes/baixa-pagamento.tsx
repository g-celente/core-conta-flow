import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle2, Info, Lock, Split, TicketCheck } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { useFeatures } from "@/components/app/FeaturesContext";
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
import { brl, centrosDeCusto, contasBancarias } from "@/lib/mock-data";

export const Route = createFileRoute("/baixa-pagamento")({
  validateSearch: (search: Record<string, unknown>): { titulo?: string } => ({
    ...(typeof search["titulo"] === "string" ? { titulo: search["titulo"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Baixa de pagamento — FinCore" },
      {
        name: "description",
        content: "Liquide títulos informando juros, desconto, conta de saída e forma de pagamento.",
      },
      { property: "og:title", content: "Baixa de pagamento — FinCore" },
      {
        property: "og:description",
        content: "Baixa total ou parcial com cálculo automático do valor devido.",
      },
    ],
  }),
  component: BaixaPagamento,
});

const FORMAS = ["PIX", "TED", "Boleto bancário", "Débito automático"];

function BaixaPagamento() {
  const router = useRouter();
  const { titulo: tituloId } = Route.useSearch();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { has } = useFeatures();
  const { titulos, baixarTitulo } = useDados();

  const abertos = useMemo(
    () => titulos.filter((t) => t.status !== "Pago" && t.status !== "Cancelado"),
    [titulos],
  );

  const [selecionado, setSelecionado] = useState<string>(
    tituloId && titulos.some((t) => t.id === tituloId) ? tituloId : (abertos[0]?.id ?? ""),
  );
  const [juros, setJuros] = useState("0");
  const [desconto, setDesconto] = useState("0");
  const [valorPago, setValorPago] = useState<string>("");
  const [conta, setConta] = useState(contasBancarias[0]!);
  const [forma, setForma] = useState(FORMAS[0]!);
  const [data, setData] = useState("2026-06-30");

  const titulo = titulos.find((t) => t.id === selecionado);
  const jurosNum = Number(juros.replace(",", ".")) || 0;
  const descontoNum = Number(desconto.replace(",", ".")) || 0;
  const totalCalculado = titulo ? titulo.valor + jurosNum - descontoNum : 0;
  const pagoNum = valorPago === "" ? totalCalculado : Number(valorPago.replace(",", ".")) || 0;
  const remanescente = +(totalCalculado - pagoNum).toFixed(2);
  const parcial = remanescente > 0.009;

  const confirmar = () => {
    if (!titulo || pagoNum <= 0) return;
    baixarTitulo(
      titulo.id,
      {
        data: data.split("-").reverse().join("/"),
        valorPago: pagoNum,
        juros: jurosNum,
        desconto: descontoNum,
        conta,
      },
      perfil.usuario,
    );
    registrar({
      tipo: "crud",
      entidade: "Título a pagar",
      operacao: "Baixa",
      detalhe: `${titulo.documento} liquidado por ${brl(pagoNum)} via ${forma} (${conta})${
        parcial ? ` · saldo remanescente ${brl(remanescente)}` : ""
      }`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Baixa registrada", {
      description: parcial
        ? `Saldo de ${brl(remanescente)} mantido em aberto.`
        : `${titulo.documento} liquidado integralmente.`,
    });
    void router.navigate({ to: "/contas-a-pagar" });
  };

  const variabilidade = [
    {
      o_que: "O rateio exibido no resumo do título só aparece com centro de custo contratado.",
      por: "feature centro_custo",
      pv: "PV7",
    },
    {
      o_que: "A lista de contas de saída vem do cadastro bancário definido no onboarding.",
      por: "adaptador bancário do tenant",
      pv: "PV2",
    },
    {
      o_que: "A tela é inacessível para perfis somente leitura.",
      por: "perfil Contador externo",
      pv: "PV4",
    },
  ];

  if (leitura) {
    return (
      <>
        <PageHeader
          titulo="Baixa de pagamento"
          descricao="Liquidação de títulos a pagar."
          variabilidade={variabilidade}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              O perfil <strong>{perfil.nome}</strong> não executa baixas. Consulte o histórico de
              liquidações em Contas a pagar.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Baixa de pagamento"
        descricao="Registre a liquidação com juros, desconto e conta de saída."
        variabilidade={variabilidade}
      />

      {abertos.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">Nenhum título em aberto para liquidar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="shadow-card">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="b-titulo">Título a liquidar</Label>
                <Select
                  value={selecionado}
                  onValueChange={(v) => {
                    setSelecionado(v);
                    setValorPago("");
                    setJuros("0");
                    setDesconto("0");
                  }}
                >
                  <SelectTrigger id="b-titulo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {abertos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.documento} · {t.fornecedor} · {brl(t.valor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {titulo ? (
                <StatusBadge tone={tomDoStatus(titulo.status)}>
                  {titulo.status} · venc. {titulo.vencimento}
                </StatusBadge>
              ) : null}
            </CardContent>
          </Card>

          {titulo ? (
            <>
              <Card className="shadow-card">
                <CardContent className="flex flex-col justify-between gap-4 pt-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Building2 className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Beneficiário
                      </p>
                      <p className="text-base font-semibold">{titulo.fornecedor}</p>
                      <p className="num text-xs text-muted-foreground">
                        Documento {titulo.documento} · {titulo.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Valor original
                    </p>
                    <p className="num text-2xl font-bold">{brl(titulo.valor)}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid items-start gap-4 lg:grid-cols-12">
                {/* Acréscimos e deduções */}
                <Card className="shadow-card lg:col-span-5">
                  <CardHeader>
                    <CardTitle className="text-base">Acréscimos e deduções</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="b-juros">Juros / multa (+)</Label>
                      <div className="relative">
                        <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="b-juros"
                          inputMode="decimal"
                          className="num pl-9"
                          value={juros}
                          onChange={(e) => setJuros(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="b-desc">Desconto (−)</Label>
                      <div className="relative">
                        <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="b-desc"
                          inputMode="decimal"
                          className="num pl-9"
                          value={desconto}
                          onChange={(e) => setDesconto(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-3">
                      <span className="text-sm font-semibold">Total calculado</span>
                      <span className="num font-bold">{brl(totalCalculado)}</span>
                    </div>

                    {has("centro_custo") ? (
                      <div className="rounded-lg border border-border p-3">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          <Split className="size-3.5" /> Rateio do título
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {titulo.rateio.map((r) => {
                            const c = centrosDeCusto.find((x) => x.id === r.centroId);
                            return (
                              <li
                                key={r.centroId}
                                className="flex items-center justify-between gap-2 text-xs"
                              >
                                <span>
                                  <span className="num text-muted-foreground">{c?.codigo}</span>{" "}
                                  {c?.descricao}
                                </span>
                                <span className="num text-muted-foreground">
                                  {r.percentual}% · {brl((pagoNum * r.percentual) / 100)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Efetivação */}
                <Card className="shadow-card lg:col-span-7">
                  <CardHeader>
                    <CardTitle className="text-base">Dados da efetivação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="b-data">Data de pagamento *</Label>
                        <Input
                          id="b-data"
                          type="date"
                          className="num"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="b-pago">Valor pago efetivamente *</Label>
                        <div className="relative">
                          <span className="num pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                            R$
                          </span>
                          <Input
                            id="b-pago"
                            inputMode="decimal"
                            placeholder={totalCalculado.toFixed(2)}
                            className="num h-14 pl-14 text-xl font-semibold"
                            value={valorPago}
                            onChange={(e) => setValorPago(e.target.value)}
                          />
                        </div>
                        {parcial ? (
                          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/15 p-3">
                            <Info className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                            <div>
                              <p className="text-sm font-semibold text-warning-foreground">
                                Pagamento parcial detectado
                              </p>
                              <p className="mt-0.5 text-xs text-warning-foreground/90">
                                Um saldo remanescente de{" "}
                                <strong className="num">{brl(remanescente)}</strong> será mantido em
                                aberto para este título.
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="b-conta">Conta de saída *</Label>
                        <Select value={conta} onValueChange={setConta}>
                          <SelectTrigger id="b-conta">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contasBancarias.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="b-forma">Forma de pagamento *</Label>
                        <Select value={forma} onValueChange={setForma}>
                          <SelectTrigger id="b-forma">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORMAS.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-card">
                <CardContent className="flex flex-wrap items-center justify-end gap-3 pt-6">
                  <span className="mr-auto hidden text-xs text-muted-foreground sm:block">
                    Ações de baixa são irreversíveis após confirmação.
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => void router.navigate({ to: "/contas-a-pagar" })}
                  >
                    Cancelar
                  </Button>
                  <Button disabled={pagoNum <= 0} onClick={confirmar} className="gap-1.5">
                    <TicketCheck className="size-4" /> Confirmar baixa
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
