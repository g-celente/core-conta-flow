import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Link2, RotateCcw, ToggleLeft, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl, paresConciliacao } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conciliacao")({
  head: () => ({
    meta: [
      { title: "Conciliação bancária — FinCore" },
      {
        name: "description",
        content: "Cruze lançamentos do extrato com os títulos do sistema e confirme conciliações.",
      },
      { property: "og:title", content: "Conciliação bancária — FinCore" },
      { property: "og:description", content: "Sugestões automáticas de par extrato × sistema." },
    ],
  }),
  component: Conciliacao,
});

function Conciliacao() {
  const { has, config } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const [pares, setPares] = useState(paresConciliacao);

  if (!has("conciliacao")) {
    return (
      <>
        <PageHeader
          titulo="Conciliação bancária"
          descricao="Cruzamento de extrato bancário com os títulos do sistema."
          variabilidade={[
            {
              o_que: "A tela e o grupo Conciliação no menu só existem com o módulo contratado.",
              por: "feature conciliacao",
              pv: "PV6",
            },
          ]}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Módulo de conciliação não contratado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ative a feature <code className="num">conciliacao</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV6) para habilitar a importação de extratos e a conciliação.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const alternar = (id: string, valor: boolean) => {
    const par = pares.find((p) => p.id === id);
    setPares((l) => l.map((x) => (x.id === id ? { ...x, conciliado: valor } : x)));
    registrar({
      tipo: "crud",
      entidade: "Conciliação",
      operacao: valor ? "Conciliar" : "Desfazer conciliação",
      detalhe: `${par?.extrato.descricao ?? id} ↔ ${par?.sistema.descricao ?? ""}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    if (valor) toast.success("Lançamento conciliado");
    else toast.info("Conciliação desfeita");
  };

  const conciliados = pares.filter((p) => p.conciliado).length;
  const pendentes = pares.length - conciliados;
  const progresso = Math.round((conciliados / pares.length) * 100);

  return (
    <>
      <PageHeader
        titulo="Conciliação bancária"
        descricao={`Extrato importado em 09/06/2026 · Banco do Brasil · Ag. 1234-5 / CC 98765-4 · adaptador ${config.adaptador}`}
        variabilidade={[
          {
            o_que: "A tela inteira e o grupo Conciliação no menu dependem do módulo contratado.",
            por: "feature conciliacao",
            pv: "PV6",
          },
          {
            o_que: `O formato de arquivo lido muda com o adaptador bancário (atual: ${config.adaptador}).`,
            por: "adaptador bancário do tenant",
            pv: "PV2",
          },
          {
            o_que:
              "O perfil Contador externo visualiza a conciliação, mas não pode confirmar pares.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="warning">{pendentes} pendentes</StatusBadge>
            <StatusBadge tone="success">{conciliados} conciliados</StatusBadge>
          </>
        }
      />

      <Card className="mb-6 shadow-card">
        <CardContent className="pt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Progresso da conciliação
            </span>
            <span className="num font-bold text-success">{progresso}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 hidden grid-cols-[1fr_auto_1fr] gap-4 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground lg:grid">
        <span>Lançamentos do extrato</span>
        <span className="w-40 text-center">Ação</span>
        <span>Títulos do sistema</span>
      </div>

      <div className="space-y-3">
        {pares.map((par) => {
          const divergencia = Math.abs(par.extrato.valor - par.sistema.valor);
          return (
            <Card
              key={par.id}
              className={cn("shadow-card transition-opacity", par.conciliado && "opacity-60")}
            >
              <CardContent className="grid items-center gap-4 pt-6 lg:grid-cols-[1fr_auto_1fr]">
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
                      {leitura ? null : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => alternar(par.id, false)}
                        >
                          <RotateCcw className="size-3.5" /> Desfazer
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <StatusBadge tone={par.confianca === "alta" ? "info" : "warning"}>
                        Sugestão {par.confianca}
                      </StatusBadge>
                      {leitura ? (
                        <span className="text-xs text-muted-foreground">Só leitura</span>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => alternar(par.id, true)}
                        >
                          <Link2 className="size-3.5" /> Conciliar
                        </Button>
                      )}
                    </>
                  )}
                  <div className="hidden h-px w-full bg-border lg:block" />
                </div>

                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="num text-xs text-muted-foreground">{par.sistema.data}</p>
                  <p className="text-sm font-semibold">{par.sistema.descricao}</p>
                  <p className="num mt-1 text-base font-bold">{brl(par.sistema.valor)}</p>
                </div>

                {divergencia > 0.001 && !par.conciliado ? (
                  <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/15 p-3 lg:col-span-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                    <p className="text-xs text-warning-foreground">
                      Divergência de <strong className="num">{brl(divergencia)}</strong> entre
                      extrato e sistema. Ao conciliar, a diferença será lançada como despesa
                      financeira.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
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
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum título correspondente — lance como despesa financeira.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="num text-xs text-muted-foreground">07/06/2026</p>
            <p className="text-sm font-semibold">Título 8901 — Serviços Contábeis Aliança</p>
            <p className="num mt-1 font-bold">{brl(3200)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sem lançamento no extrato — verifique se o pagamento foi efetivado.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
