import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, paresConciliacao } from "@/lib/mock-data";

export const Route = createFileRoute("/conciliacao")({
  head: () => ({
    meta: [
      { title: "Conciliação bancária — FinCore ERP" },
      {
        name: "description",
        content: "Cruze lançamentos do extrato com os títulos do sistema e confirme conciliações.",
      },
      { property: "og:title", content: "Conciliação bancária — FinCore ERP" },
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
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Módulo de conciliação não contratado
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Ative a feature <code className="font-data-mono">conciliacao</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV6) para habilitar a importação de extratos e a conciliação.
            </p>
          </div>
        </div>
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
            <StatusBadge tone="atencao">{pendentes} pendentes</StatusBadge>
            <StatusBadge tone="ok">{conciliados} conciliados</StatusBadge>
          </>
        }
      />

      {/* Progresso */}
      <div className="mb-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Progresso da conciliação
          </span>
          <span className="font-data-mono text-data-mono font-bold text-secondary">
            {progresso}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-variant">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="mb-3 hidden grid-cols-[1fr_auto_1fr] gap-4 px-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant lg:grid">
        <span>Lançamentos do extrato</span>
        <span className="w-44 text-center">Ação</span>
        <span>Títulos do sistema</span>
      </div>

      <div className="flex flex-col gap-3">
        {pares.map((par) => {
          const divergencia = Math.abs(par.extrato.valor - par.sistema.valor);
          return (
            <div
              key={par.id}
              className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm transition-opacity ${
                par.conciliado ? "opacity-60" : ""
              }`}
            >
              <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                  <p className="font-data-mono text-body-sm text-on-surface-variant">
                    {par.extrato.data}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface">
                    {par.extrato.descricao}
                  </p>
                  <p className="mt-1 font-data-mono text-body-lg font-bold text-primary">
                    {brl(par.extrato.valor)}
                  </p>
                </div>

                <div className="flex w-full flex-col items-center gap-2 lg:w-44">
                  <div className="hidden h-px w-full bg-outline-variant lg:block" />
                  {par.conciliado ? (
                    <>
                      <StatusBadge tone="ok">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Conciliado
                      </StatusBadge>
                      {leitura ? null : (
                        <button
                          type="button"
                          onClick={() => alternar(par.id, false)}
                          className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
                        >
                          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          Desfazer
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <StatusBadge tone={par.confianca === "alta" ? "info" : "atencao"}>
                        Sugestão {par.confianca}
                      </StatusBadge>
                      {leitura ? (
                        <span className="font-body-sm text-body-sm text-outline">Só leitura</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alternar(par.id, true)}
                          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-label-md text-label-md text-on-secondary transition-colors hover:bg-on-secondary-container"
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                          Conciliar
                        </button>
                      )}
                    </>
                  )}
                  <div className="hidden h-px w-full bg-outline-variant lg:block" />
                </div>

                <div className="rounded-lg border border-outline-variant bg-surface p-3">
                  <p className="font-data-mono text-body-sm text-on-surface-variant">
                    {par.sistema.data}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface">
                    {par.sistema.descricao}
                  </p>
                  <p className="mt-1 font-data-mono text-body-lg font-bold text-primary">
                    {brl(par.sistema.valor)}
                  </p>
                </div>
              </div>

              {divergencia > 0.001 && !par.conciliado ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed p-3">
                  <span className="material-symbols-outlined text-[18px] text-on-tertiary-fixed-variant">
                    warning
                  </span>
                  <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant">
                    Divergência de <strong className="font-data-mono">{brl(divergencia)}</strong>{" "}
                    entre extrato e sistema. Ao conciliar, a diferença será lançada como despesa
                    financeira.
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Sem par sugerido */}
      <div className="mt-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Sem par sugerido
        </h3>
        <div className="grid gap-3 p-md sm:grid-cols-2">
          <div className="rounded-lg border border-dashed border-outline-variant p-3">
            <p className="font-data-mono text-body-sm text-on-surface-variant">03/06/2026</p>
            <p className="font-label-md text-label-md text-on-surface">TARIFA PACOTE SERVICOS</p>
            <p className="mt-1 font-data-mono font-bold text-primary">{brl(89.9)}</p>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Nenhum título correspondente — lance como despesa financeira.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-outline-variant p-3">
            <p className="font-data-mono text-body-sm text-on-surface-variant">07/06/2026</p>
            <p className="font-label-md text-label-md text-on-surface">
              Título 8901 — Serviços Contábeis Aliança
            </p>
            <p className="mt-1 font-data-mono font-bold text-primary">{brl(3200)}</p>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Sem lançamento no extrato — verifique se o pagamento foi efetivado.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
