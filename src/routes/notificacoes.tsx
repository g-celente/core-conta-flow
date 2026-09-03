import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — FinCore ERP" },
      {
        name: "description",
        content: "Preferências de canal e antecedência de aviso de vencimento e aprovação.",
      },
      { property: "og:title", content: "Notificações — FinCore ERP" },
      {
        property: "og:description",
        content: "Configure e-mail, in-app e push por tipo de evento.",
      },
    ],
  }),
  component: Notificacoes,
});

type Canal = "email" | "inapp" | "push";

type Evento = {
  id: string;
  nome: string;
  descricao: string;
  /** Quando definida, o evento só aparece se a feature estiver ativa. */
  requer?: "alcada" | "conciliacao" | "centro_custo";
};

const EVENTOS: Evento[] = [
  {
    id: "venc",
    nome: "Vencimento próximo",
    descricao: "Aviso antes do vencimento de títulos a pagar e a receber.",
  },
  {
    id: "atraso",
    nome: "Título em atraso",
    descricao: "Disparado no dia seguinte ao vencimento sem baixa.",
  },
  {
    id: "aprov",
    nome: "Título aguardando aprovação",
    descricao: "Enviado ao aprovador quando um título entra na fila.",
    requer: "alcada",
  },
  {
    id: "devol",
    nome: "Título devolvido",
    descricao: "Enviado a quem lançou o título, com a justificativa.",
    requer: "alcada",
  },
  {
    id: "concil",
    nome: "Extrato importado",
    descricao: "Resumo das linhas lidas e das divergências encontradas.",
    requer: "conciliacao",
  },
  {
    id: "rateio",
    nome: "Rateio incompleto",
    descricao: "Alerta quando um título é salvo com rateio fora de 100%.",
    requer: "centro_custo",
  },
  {
    id: "fecha",
    nome: "Fechamento mensal",
    descricao: "Lembrete de conferência no último dia útil do mês.",
  },
];

const CANAIS: { id: Canal; nome: string; icone: string; requer?: "notificacoes_push" }[] = [
  { id: "email", nome: "E-mail", icone: "mail" },
  { id: "inapp", nome: "In-app", icone: "notifications" },
  { id: "push", nome: "Push", icone: "phone_iphone", requer: "notificacoes_push" },
];

function Notificacoes() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const eventos = EVENTOS.filter((e) => (e.requer ? has(e.requer) : true));
  const canais = CANAIS.filter((c) => (c.requer ? has(c.requer) : true));

  const [prefs, setPrefs] = useState<Record<string, Record<Canal, boolean>>>(() =>
    Object.fromEntries(
      EVENTOS.map((e) => [e.id, { email: true, inapp: true, push: e.id !== "fecha" }]),
    ),
  );
  const [antecedencia, setAntecedencia] = useState(3);
  const [horario, setHorario] = useState("08:00");
  const [resumoDiario, setResumoDiario] = useState(true);

  const alternar = (eventoId: string, canal: Canal) =>
    setPrefs((p) => ({
      ...p,
      [eventoId]: { ...p[eventoId]!, [canal]: !p[eventoId]![canal] },
    }));

  const salvar = () => {
    const ativos = eventos.reduce(
      (s, e) => s + canais.filter((c) => prefs[e.id]?.[c.id]).length,
      0,
    );
    registrar({
      tipo: "feature",
      entidade: "Notificações",
      operacao: "Salvar preferências",
      detalhe: `${ativos} combinações evento×canal ativas · antecedência ${antecedencia} dia(s) · envio às ${horario}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Preferências de notificação salvas");
  };

  return (
    <>
      <PageHeader
        titulo="Notificações"
        descricao="Escolha os canais e a antecedência de cada tipo de aviso."
        variabilidade={[
          {
            o_que: "A coluna Push só existe quando a feature de notificações push está contratada.",
            por: "feature notificacoes_push",
            pv: "PV5",
          },
          {
            o_que: "Os eventos de aprovação e devolução só aparecem com a feature de alçada.",
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que:
              "Os eventos de extrato importado e rateio incompleto dependem de conciliação e centro de custo.",
            por: "features conciliacao e centro_custo",
            pv: "PV6 / PV7",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <button
              type="button"
              onClick={salvar}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar preferências
            </button>
          )
        }
      />

      {!has("notificacoes_push") ? (
        <div className="mb-md flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container p-4">
          <span className="material-symbols-outlined text-on-surface-variant">mobile_off</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            O canal <strong>Push</strong> não está contratado neste tenant (PV5). Ative a feature{" "}
            <code className="font-data-mono">notificacoes_push</code> em{" "}
            <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
              Features do tenant
            </Link>{" "}
            para exibir a coluna.
          </p>
        </div>
      ) : null}

      {/* Matriz evento × canal */}
      <div className="mb-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant bg-surface px-md py-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">Canais por evento</h3>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            {eventos.length} eventos disponíveis · {canais.length} canais contratados.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Evento</th>
                {canais.map((c) => (
                  <th
                    key={c.id}
                    className="w-28 p-3 text-center font-label-md text-label-md text-on-surface-variant"
                  >
                    <span className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">{c.icone}</span>
                      {c.nome}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {eventos.map((e) => (
                <tr key={e.id} className="hover:bg-surface-container-low">
                  <td className="p-3">
                    <span className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface">
                      {e.nome}
                      {e.requer ? (
                        <code className="rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-[10px] text-on-surface-variant">
                          {e.requer}
                        </code>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">
                      {e.descricao}
                    </span>
                  </td>
                  {canais.map((c) => (
                    <td key={c.id} className="p-3 text-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          disabled={leitura}
                          checked={prefs[e.id]?.[c.id] ?? false}
                          onChange={() => alternar(e.id, c.id)}
                        />
                        <span className="h-6 w-11 rounded-full bg-surface-variant transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regras de envio */}
      <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <label
            htmlFor="n-ant"
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
          >
            Antecedência do aviso de vencimento
          </label>
          <div className="flex items-center gap-3">
            <input
              id="n-ant"
              type="range"
              min={1}
              max={15}
              disabled={leitura}
              value={antecedencia}
              onChange={(e) => setAntecedencia(Number(e.target.value))}
              className="flex-1 accent-[var(--color-secondary)]"
            />
            <span className="w-20 shrink-0 font-data-mono text-data-mono text-on-surface">
              {antecedencia} dia{antecedencia === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            Títulos que vencem em até {antecedencia} dia{antecedencia === 1 ? "" : "s"} geram aviso.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <label
            htmlFor="n-hora"
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
          >
            Horário de envio
          </label>
          <input
            id="n-hora"
            type="time"
            disabled={leitura}
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-data-mono text-data-mono focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60"
          />
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            Horário de Brasília. Avisos críticos são enviados imediatamente.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <p className="mb-1.5 font-label-md text-label-md text-on-surface-variant">
            Resumo diário consolidado
          </p>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="font-body-md text-body-md text-on-surface">
              Agrupar todos os avisos do dia em um único e-mail
            </span>
            <span className="relative inline-flex shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                disabled={leitura}
                checked={resumoDiario}
                onChange={(e) => setResumoDiario(e.target.checked)}
              />
              <span className="h-6 w-11 rounded-full bg-surface-variant transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full peer-disabled:opacity-50" />
            </span>
          </label>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            {resumoDiario
              ? "Um e-mail por dia com todos os eventos."
              : "Um e-mail por evento, no momento em que ocorre."}
          </p>
        </div>
      </div>

      {!leitura ? (
        <div className="mt-md flex justify-end">
          <button
            type="button"
            onClick={() =>
              toast.info("Notificação de teste enviada", {
                description: `Canais ativos: ${canais.map((c) => c.nome).join(", ")}.`,
              })
            }
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Enviar notificação de teste
          </button>
        </div>
      ) : null}
    </>
  );
}
