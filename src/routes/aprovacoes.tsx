import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, FileCheck2, ShieldCheck, ToggleLeft, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus } from "@/components/app/StatusBadge";
import { KpiCard } from "@/components/app/KpiCard";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl, centrosDeCusto, type TituloPagar } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aprovacoes")({
  head: () => ({
    meta: [
      { title: "Fila de aprovação — FinCore" },
      {
        name: "description",
        content: "Títulos acima da alçada do operador aguardando aprovação ou devolução.",
      },
      { property: "og:title", content: "Fila de aprovação — FinCore" },
      { property: "og:description", content: "Aprove ou devolva títulos com justificativa." },
    ],
  }),
  component: Aprovacoes,
});

const ALCADA = 10000;

function Aprovacoes() {
  const { perfil, leitura } = usePerfil();
  const { has } = useFeatures();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos, aprovarTitulo, devolverTitulo } = useDados();

  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [devolvendo, setDevolvendo] = useState<TituloPagar | null>(null);
  const [justificativa, setJustificativa] = useState("");

  const pendentes = titulos.filter((t) => t.status === "Aprovação pendente");
  const total = pendentes.reduce((s, t) => s + t.valor, 0);
  const detalhe = titulos.find((t) => t.id === (selecionado ?? pendentes[0]?.id));

  if (!has("alcada")) {
    return (
      <>
        <PageHeader
          titulo="Fila de aprovação"
          descricao="Aprovação hierárquica de pagamentos."
          variabilidade={[
            {
              o_que:
                "A tela e o grupo Aprovações no menu só existem com a feature de alçada ativa.",
              por: "feature alcada",
              pv: "PV3",
            },
          ]}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Aprovação por alçada não contratada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Neste tenant os títulos são salvos direto como “Em aberto”. Ative a feature{" "}
                <code className="num">alcada</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV3) para habilitar a fila.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const aprovar = (t: TituloPagar) => {
    aprovarTitulo(t.id, perfil.usuario);
    registrar({
      tipo: "aprovacao",
      entidade: "Título a pagar",
      operacao: "Aprovar",
      detalhe: `${t.documento} · ${brl(t.valor)} aprovado por ${perfil.nome}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Título aprovado para pagamento", {
      description: `${t.documento} · ${brl(t.valor)}`,
    });
  };

  const confirmarDevolucao = () => {
    if (!devolvendo || justificativa.trim().length < 5) return;
    devolverTitulo(devolvendo.id, perfil.usuario, justificativa.trim());
    registrar({
      tipo: "aprovacao",
      entidade: "Título a pagar",
      operacao: "Devolver",
      detalhe: `${devolvendo.documento} devolvido a ${devolvendo.lancadoPor}: ${justificativa.trim()}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.info(`Título devolvido a ${devolvendo.lancadoPor}`);
    setDevolvendo(null);
    setJustificativa("");
  };

  return (
    <>
      <PageHeader
        titulo="Aprovação por alçada"
        descricao={`Gerencie e aprove pagamentos acima da alçada de ${brl(ALCADA)}.`}
        variabilidade={[
          {
            o_que:
              "A tela inteira e o grupo Aprovações no menu só existem com a feature de alçada.",
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que:
              "O campo Centro de custo no detalhe do título aparece só com centro_custo ativo.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "Os botões Aprovar e Devolver ficam ocultos para o perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="warning">{pendentes.length} aguardando</StatusBadge>
            <StatusBadge tone="info">Total {brl(total)}</StatusBadge>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard
          rotulo={`Total pendente (${pendentes.length})`}
          icone={FileCheck2}
          corIcone="text-primary"
          corValor="text-primary"
          valor={brl(total)}
          rodape={`Alçada do perfil ${perfil.nome}: ${brl(ALCADA)}`}
        />
        <KpiCard
          rotulo="Aprovados na sessão"
          icone={CheckCircle2}
          corIcone="text-success"
          valor={String(
            titulos.filter((t) => t.historico.some((h) => h.descricao.includes("Aprovado"))).length,
          )}
          rodape="Contagem desta sessão"
        />
        <KpiCard
          rotulo="Devolvidos na sessão"
          icone={Undo2}
          corIcone="text-destructive"
          valor={String(
            titulos.filter((t) => t.historico.some((h) => h.descricao.startsWith("Devolvido")))
              .length,
          )}
          rodape="Exige justificativa"
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-5">
        {/* Fila */}
        <div className="flex flex-col gap-3 xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Fila de aprovação
          </p>
          {pendentes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="flex items-start gap-3 pt-6">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <p className="text-sm text-muted-foreground">
                  Nenhum título aguardando aprovação. Lance um título acima de {brl(ALCADA)} em
                  Contas a pagar para ver a fila em ação.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendentes.map((t) => {
              const ativo = detalhe?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelecionado(t.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "shadow-card transition-all",
                      ativo ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="num rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {t.documento}
                        </span>
                        <StatusBadge tone={tomDoStatus(t.status)}>{t.status}</StatusBadge>
                      </div>
                      <p className="font-semibold">{t.fornecedor}</p>
                      <p className="mb-3 text-xs text-muted-foreground">{t.categoria}</p>
                      <div className="flex items-end justify-between gap-3">
                        <span className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Vencimento</span>
                          <span className="num text-sm">{t.vencimento}</span>
                        </span>
                        <span className="num text-lg font-bold">{brl(t.valor)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })
          )}
        </div>

        {/* Detalhe */}
        {detalhe ? (
          <Card className="shadow-card xl:col-span-3">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span className="num mb-2 inline-flex rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                    Título {detalhe.documento}
                  </span>
                  <h2 className="text-xl font-bold">{detalhe.fornecedor}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lançado por {detalhe.lancadoPor} · {detalhe.categoria}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Valor do pagamento</p>
                  <p className="num text-2xl font-bold">{brl(detalhe.valor)}</p>
                </div>
              </div>

              <div className="grid gap-4 border-b border-border py-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Vencimento</p>
                  <p className="num text-sm font-medium">{detalhe.vencimento}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Status</p>
                  <StatusBadge tone={tomDoStatus(detalhe.status)}>{detalhe.status}</StatusBadge>
                </div>
                {has("centro_custo") ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Centro de custo</p>
                    <p className="text-sm font-medium">
                      {detalhe.rateio
                        .map((r) => {
                          const c = centrosDeCusto.find((x) => x.id === r.centroId);
                          return `${c?.codigo ?? "—"} (${r.percentual}%)`;
                        })
                        .join(" · ")}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Parcela / recorrência</p>
                  <p className="text-sm font-medium">
                    {detalhe.parcela ?? "À vista"}
                    {detalhe.recorrencia ? ` · ${detalhe.recorrencia}` : ""}
                  </p>
                </div>
              </div>

              <div className="border-b border-border py-5">
                <h3 className="mb-4 text-base font-semibold">Fluxo de aprovação</h3>
                <ol className="flex flex-col gap-4">
                  <li className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        Revisão nível 1 — conferência documental
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Aprovado por {detalhe.lancadoPor}
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-primary">
                        Aprovação {perfil.nome} (sua alçada)
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Aguardando sua ação · limite {brl(ALCADA)}
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-3 opacity-60">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-border text-muted-foreground">
                      <CreditCard className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">Liberação para pagamento</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Após aprovação, o título fica disponível para baixa
                      </span>
                    </span>
                  </li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-5">
                {leitura ? (
                  <p className="mr-auto text-xs text-muted-foreground">
                    Perfil somente leitura: aprovação e devolução indisponíveis.
                  </p>
                ) : (
                  <>
                    <span className="mr-auto hidden text-xs text-muted-foreground sm:block">
                      A devolução exige justificativa de no mínimo 5 caracteres.
                    </span>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setDevolvendo(detalhe)}
                    >
                      <Undo2 className="size-4" /> Devolver
                    </Button>
                    <Button className="gap-1.5" onClick={() => aprovar(detalhe)}>
                      <CheckCircle2 className="size-4" /> Aprovar pagamento
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Dialog
        open={!!devolvendo}
        onOpenChange={(o) => {
          if (!o) {
            setDevolvendo(null);
            setJustificativa("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver título</DialogTitle>
            <DialogDescription>
              {devolvendo
                ? `${devolvendo.fornecedor} · ${brl(devolvendo.valor)} · venc. ${devolvendo.vencimento}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="justificativa">
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justificativa"
              rows={4}
              placeholder="Ex.: nota fiscal divergente do pedido de compra 2026/0412."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 5 caracteres. A justificativa é enviada a quem lançou o título e gravada na
              trilha de auditoria.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDevolvendo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={justificativa.trim().length < 5}
              onClick={confirmarDevolucao}
            >
              Confirmar devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
