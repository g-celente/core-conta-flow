import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus } from "@/components/app/StatusBadge";
import { KpiCard } from "@/components/app/KpiCard";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl, centrosDeCusto, type TituloPagar } from "@/lib/mock-data";

export const Route = createFileRoute("/aprovacoes")({
  head: () => ({
    meta: [
      { title: "Fila de aprovação — FinCore ERP" },
      {
        name: "description",
        content: "Títulos acima da alçada do operador aguardando aprovação ou devolução.",
      },
      { property: "og:title", content: "Fila de aprovação — FinCore ERP" },
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
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Aprovação por alçada não contratada
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Neste tenant os títulos são salvos direto como “Em aberto”. Ative a feature{" "}
              <code className="font-data-mono">alcada</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV3) para habilitar a fila.
            </p>
          </div>
        </div>
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
            por: "perfis Aprovador e Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="atencao">{pendentes.length} aguardando</StatusBadge>
            <StatusBadge tone="info">Total {brl(total)}</StatusBadge>
          </>
        }
      />

      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-3">
        <KpiCard
          rotulo={`Total pendente (${pendentes.length})`}
          icone="fact_check"
          corIcone="text-secondary"
          corValor="text-secondary"
          valor={brl(total)}
          rodape={`Alçada do perfil ${perfil.nome}: ${brl(ALCADA)}`}
        />
        <KpiCard
          rotulo="Aprovados na sessão"
          icone="task_alt"
          valor={String(
            titulos.filter((t) => t.historico.some((h) => h.descricao.includes("Aprovado"))).length,
          )}
          rodape="Contagem desta sessão"
        />
        <KpiCard
          rotulo="Devolvidos na sessão"
          icone="undo"
          corIcone="text-error"
          valor={String(
            titulos.filter((t) => t.historico.some((h) => h.descricao.startsWith("Devolvido")))
              .length,
          )}
          rodape="Exige justificativa"
        />
      </div>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-5">
        {/* Fila */}
        <div className="flex flex-col gap-md xl:col-span-2">
          <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Fila de aprovação
          </h3>
          {pendentes.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <span className="material-symbols-outlined text-secondary">task_alt</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Nenhum título aguardando aprovação. Lance um título acima de {brl(ALCADA)} em Contas
                a pagar para ver a fila em ação.
              </p>
            </div>
          ) : (
            pendentes.map((t) => {
              const ativo = detalhe?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelecionado(t.id)}
                  className={`rounded-xl border p-md text-left shadow-sm transition-all ${
                    ativo
                      ? "border-2 border-secondary bg-secondary/5"
                      : "border-outline-variant bg-surface-container-lowest hover:border-secondary/50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded bg-surface-variant px-2 py-0.5 font-data-mono text-[11px] text-on-surface-variant">
                      {t.documento}
                    </span>
                    <StatusBadge tone={tomDoStatus(t.status)}>{t.status}</StatusBadge>
                  </div>
                  <h4 className="mb-1 font-body-lg text-body-lg font-semibold text-on-background">
                    {t.fornecedor}
                  </h4>
                  <p className="mb-3 font-body-sm text-body-sm text-on-surface-variant">
                    {t.categoria}
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <span className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Vencimento
                      </span>
                      <span className="font-data-mono text-data-mono text-on-surface">
                        {t.vencimento}
                      </span>
                    </span>
                    <span className="font-data-mono text-body-lg font-bold text-primary">
                      {brl(t.valor)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detalhe */}
        {detalhe ? (
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm xl:col-span-3">
            <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface p-md sm:flex-row sm:items-start sm:justify-between md:p-lg">
              <div className="min-w-0">
                <span className="mb-2 inline-flex rounded bg-surface-variant px-2 py-1 font-data-mono text-[11px] text-on-surface-variant">
                  Título {detalhe.documento}
                </span>
                <h2 className="font-headline-md text-headline-md text-on-background">
                  {detalhe.fornecedor}
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Lançado por {detalhe.lancadoPor} · {detalhe.categoria}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Valor do pagamento
                </p>
                <p className="font-data-mono text-display-lg text-primary">{brl(detalhe.valor)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md border-b border-outline-variant p-md md:grid-cols-4 md:p-lg">
              <div>
                <p className="mb-1 font-body-sm text-body-sm text-on-surface-variant">Vencimento</p>
                <p className="font-data-mono text-data-mono font-medium text-on-background">
                  {detalhe.vencimento}
                </p>
              </div>
              <div>
                <p className="mb-1 font-body-sm text-body-sm text-on-surface-variant">Status</p>
                <StatusBadge tone={tomDoStatus(detalhe.status)}>{detalhe.status}</StatusBadge>
              </div>
              {has("centro_custo") ? (
                <div>
                  <p className="mb-1 font-body-sm text-body-sm text-on-surface-variant">
                    Centro de custo
                  </p>
                  <p className="font-body-md text-body-md font-medium text-on-background">
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
                <p className="mb-1 font-body-sm text-body-sm text-on-surface-variant">
                  Parcela / recorrência
                </p>
                <p className="font-body-md text-body-md font-medium text-on-background">
                  {detalhe.parcela ?? "À vista"}
                  {detalhe.recorrencia ? ` · ${detalhe.recorrencia}` : ""}
                </p>
              </div>
            </div>

            {/* Fluxo de aprovação */}
            <div className="border-b border-outline-variant p-md md:p-lg">
              <h4 className="mb-4 font-headline-sm text-headline-sm text-on-background">
                Fluxo de aprovação
              </h4>
              <ol className="flex flex-col gap-4">
                <li className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </span>
                  <span>
                    <span className="block font-label-md text-label-md font-semibold text-on-background">
                      Revisão nível 1 — conferência documental
                    </span>
                    <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">
                      Aprovado por {detalhe.lancadoPor}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary ring-4 ring-primary-fixed">
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  </span>
                  <span>
                    <span className="block font-label-md text-label-md font-bold text-primary">
                      Aprovação {perfil.nome} (sua alçada)
                    </span>
                    <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">
                      Aguardando sua ação · limite {brl(ALCADA)}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3 opacity-60">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-outline-variant text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </span>
                  <span>
                    <span className="block font-label-md text-label-md text-on-surface">
                      Liberação para pagamento
                    </span>
                    <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">
                      Após aprovação, o título fica disponível para baixa
                    </span>
                  </span>
                </li>
              </ol>
            </div>

            {/* Ações */}
            <div className="mt-auto flex flex-wrap items-center justify-end gap-3 bg-surface-container-low p-md md:p-lg">
              {leitura ? (
                <p className="mr-auto font-body-sm text-body-sm text-on-surface-variant">
                  Perfil somente leitura: aprovação e devolução indisponíveis.
                </p>
              ) : (
                <>
                  <span className="mr-auto hidden font-body-sm text-body-sm text-on-surface-variant sm:block">
                    A devolução exige justificativa de no mínimo 5 caracteres.
                  </span>
                  <button
                    type="button"
                    onClick={() => setDevolvendo(detalhe)}
                    className="flex items-center gap-2 rounded-lg border border-outline px-5 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Devolver
                  </button>
                  <button
                    type="button"
                    onClick={() => aprovar(detalhe)}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Aprovar pagamento
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Devolução */}
      <Dialog
        open={!!devolvendo}
        onOpenChange={(o) => {
          if (!o) {
            setDevolvendo(null);
            setJustificativa("");
          }
        }}
      >
        <DialogContent className="border-outline-variant bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="font-headline-sm text-headline-sm text-primary">
              Devolver título
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              {devolvendo
                ? `${devolvendo.fornecedor} · ${brl(devolvendo.valor)} · venc. ${devolvendo.vencimento}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="justificativa"
              className="font-label-md text-label-md text-on-surface-variant"
            >
              Justificativa <span className="text-error">*</span>
            </label>
            <textarea
              id="justificativa"
              rows={4}
              placeholder="Ex.: nota fiscal divergente do pedido de compra 2026/0412."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Mínimo de 5 caracteres. A justificativa é enviada a quem lançou o título e gravada na
              trilha de auditoria.
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDevolvendo(null)}
              className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={justificativa.trim().length < 5}
              onClick={confirmarDevolucao}
              className="rounded-lg bg-error px-4 py-2 font-label-md text-label-md text-on-error shadow-sm transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmar devolução
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
