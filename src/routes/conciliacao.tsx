import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conciliacao")({
  head: () => ({
    meta: [
      { title: "Conciliação bancária — FinCore" },
      {
        name: "description",
        content: "Compare extrato importado e lançamentos do sistema com sugestões de pares.",
      },
      { property: "og:title", content: "Conciliação bancária — FinCore" },
      { property: "og:description", content: "Sugestões automáticas de pares e desfazer conciliação." },
    ],
  }),
  component: Conciliacao,
});

type Par = {
  id: string;
  extrato: { data: string; descricao: string; valor: number };
  sistema: { data: string; descricao: string; valor: number };
  conciliado: boolean;
  confianca: "alta" | "média";
};

const paresIniciais: Par[] = [
  {
    id: "p1",
    extrato: { data: "01/06/2026", descricao: "TED RECEBIDA - MERCADO CENTRAL", valor: 12450.0 },
    sistema: { data: "01/06/2026", descricao: "NF 4521 — Mercado Central Ltda", valor: 12450.0 },
    conciliado: true,
    confianca: "alta",
  },
  {
    id: "p2",
    extrato: { data: "02/06/2026", descricao: "PIX ENVIADO - EMBALAGENS IPIRANGA", valor: 7350.0 },
    sistema: { data: "02/06/2026", descricao: "Título 8842 — Embalagens Ipiranga ME", valor: 7350.0 },
    conciliado: false,
    confianca: "alta",
  },
  {
    id: "p3",
    extrato: { data: "05/06/2026", descricao: "BOLETO PAGO - ENERGISA", valor: 12760.35 },
    sistema: { data: "04/06/2026", descricao: "Energia elétrica — junho/2026", valor: 12758.9 },
    conciliado: false,
    confianca: "média",
  },
  {
    id: "p4",
    extrato: { data: "08/06/2026", descricao: "DEPOSITO DINHEIRO - CAIXA LOJA 2", valor: 4820.75 },
    sistema: { data: "08/06/2026", descricao: "Fechamento de caixa Loja 2", valor: 4820.75 },
    conciliado: false,
    confianca: "alta",
  },
];

function Conciliacao() {
  const [pares, setPares] = useState(paresIniciais);

  const alternar = (id: string, valor: boolean) => {
    setPares((p) => p.map((x) => (x.id === id ? { ...x, conciliado: valor } : x)));
    toast[valor ? "success" : "info"](valor ? "Lançamento conciliado" : "Conciliação desfeita");
  };

  const pendentes = pares.filter((p) => !p.conciliado).length;

  return (
    <>
      <PageHeader
        titulo="Conciliação bancária"
        descricao="Extrato importado em 09/06/2026 · Banco do Brasil · Ag. 1234-5 / CC 98765-4"
        acoes={<StatusBadge tone="warning">{pendentes} pendentes</StatusBadge>}
      />

      <div className="mb-3 hidden grid-cols-[1fr_auto_1fr] gap-4 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground lg:grid">
        <span>Lançamentos do extrato</span>
        <span className="w-40 text-center">Ação</span>
        <span>Lançamentos do sistema</span>
      </div>

      <div className="space-y-3">
        {pares.map((par) => (
          <Card
            key={par.id}
            className={cn("shadow-card transition-opacity", par.conciliado && "opacity-60")}
          >
            <CardContent className="grid items-center gap-4 pt-6 lg:grid-cols-[1fr_auto_1fr] lg:pt-6">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="num text-xs text-muted-foreground">{par.extrato.data}</p>
                <p className="text-sm font-semibold">{par.extrato.descricao}</p>
                <p className="num mt-1 text-base font-bold">{brl(par.extrato.valor)}</p>
              </div>

              <div className="flex w-full flex-col items-center gap-2 lg:w-40">
                <div className="hidden h-px w-full bg-border lg:block" />
                {par.conciliado ? (
                  <>
                    <StatusBadge tone="success">
                      <CheckCircle2 className="size-3.5" /> Conciliado
                    </StatusBadge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alternar(par.id, false)}
                      className="gap-1.5"
                    >
                      <RotateCcw className="size-3.5" /> Desfazer
                    </Button>
                  </>
                ) : (
                  <>
                    <StatusBadge tone={par.confianca === "alta" ? "info" : "warning"}>
                      Sugestão {par.confianca}
                    </StatusBadge>
                    <Button size="sm" onClick={() => alternar(par.id, true)} className="gap-1.5">
                      <Link2 className="size-3.5" /> Conciliar
                    </Button>
                  </>
                )}
                <div className="hidden h-px w-full bg-border lg:block" />
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <p className="num text-xs text-muted-foreground">{par.sistema.data}</p>
                <p className="text-sm font-semibold">{par.sistema.descricao}</p>
                <p className="num mt-1 text-base font-bold">{brl(par.sistema.valor)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Sem par sugerido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="num text-xs text-muted-foreground">03/06/2026</p>
            <p className="text-sm font-semibold">TARIFA PACOTE SERVICOS</p>
            <p className="num mt-1 font-bold">{brl(89.9)}</p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="num text-xs text-muted-foreground">07/06/2026</p>
            <p className="text-sm font-semibold">Título 8901 — Serviços Contábeis Aliança</p>
            <p className="num mt-1 font-bold">{brl(3200)}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
