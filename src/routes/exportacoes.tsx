import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/exportacoes")({
  head: () => ({
    meta: [
      { title: "Exportar dados — FinCore ERP" },
      {
        name: "description",
        content:
          "Gere arquivos de títulos, extratos e balancetes nos formatos aceitos pela contabilidade.",
      },
      { property: "og:title", content: "Exportar dados — FinCore ERP" },
      { property: "og:description", content: "Fila de exportações com histórico da sessão." },
    ],
  }),
  component: Exportacoes,
});

type Pacote = {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  formatos: string[];
  requer?: "conciliacao" | "centro_custo" | "portal_contador" | "multiempresa";
};

const PACOTES: Pacote[] = [
  {
    id: "titulos",
    nome: "Títulos a pagar e a receber",
    descricao: "Todos os títulos do período com status, parceiro, categoria e valores.",
    icone: "receipt_long",
    formatos: ["CSV", "XLSX"],
  },
  {
    id: "extrato",
    nome: "Extrato conciliado",
    descricao: "Linhas do extrato com o título conciliado correspondente.",
    icone: "account_balance",
    formatos: ["CSV", "OFX"],
    requer: "conciliacao",
  },
  {
    id: "rateio",
    nome: "Rateio por centro de custo",
    descricao: "Distribuição do valor de cada título entre os centros de custo.",
    icone: "call_split",
    formatos: ["CSV", "XLSX"],
    requer: "centro_custo",
  },
  {
    id: "balancete",
    nome: "Balancete contábil",
    descricao: "Saldos por conta do plano de contas no padrão exigido pela contabilidade.",
    icone: "menu_book",
    formatos: ["TXT", "XLSX"],
    requer: "portal_contador",
  },
  {
    id: "consolidado",
    nome: "Consolidado do grupo",
    descricao: "Somatório de todas as empresas sob a mesma conta raiz.",
    icone: "domain",
    formatos: ["XLSX"],
    requer: "multiempresa",
  },
  {
    id: "auditoria",
    nome: "Trilha de auditoria",
    descricao: "Log de operações da sessão com usuário, data e detalhe.",
    icone: "history_edu",
    formatos: ["CSV"],
  },
];

type Job = { id: string; pacote: string; formato: string; hora: string; status: "Concluído" };

function Exportacoes() {
  const { has, config } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual, consolidado } = useEmpresa();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);

  const disponiveis = PACOTES.filter((p) => (p.requer ? has(p.requer) : true));
  const bloqueados = PACOTES.filter((p) => p.requer && !has(p.requer));

  const exportar = (p: Pacote, formato: string) => {
    setProcessando(p.id);
    registrar({
      tipo: "crud",
      entidade: "Exportação",
      operacao: "Gerar arquivo",
      detalhe: `${p.nome} em ${formato}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    window.setTimeout(() => {
      setProcessando(null);
      setJobs((l) => [
        {
          id: `job-${Date.now()}`,
          pacote: p.nome,
          formato,
          hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          status: "Concluído",
        },
        ...l,
      ]);
      toast.success(`${p.nome} exportado`, {
        description: `Arquivo ${formato} pronto para download.`,
      });
    }, 900);
  };

  return (
    <>
      <PageHeader
        titulo="Exportar dados"
        descricao={`Escopo: ${consolidado && has("multiempresa") ? "todas as empresas do grupo" : nomeAtual} · perfil de produto ${config.perfilProduto}.`}
        variabilidade={[
          {
            o_que: "O pacote Extrato conciliado exige o módulo de conciliação bancária.",
            por: "feature conciliacao",
            pv: "PV6",
          },
          {
            o_que: "O pacote Rateio por centro de custo exige a feature centro_custo.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "O Balancete contábil no layout da contabilidade exige portal do contador.",
            por: "feature portal_contador",
            pv: "PV4",
          },
          {
            o_que:
              "O Consolidado do grupo exige multiempresa; o formato do extrato segue o adaptador.",
            por: "features multiempresa e adaptador",
            pv: "PV7 / PV2",
          },
        ]}
        acoes={
          <StatusBadge tone="info">
            {disponiveis.length} de {PACOTES.length} pacotes disponíveis
          </StatusBadge>
        }
      />

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2 xl:grid-cols-3">
        {disponiveis.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined">{p.icone}</span>
            </span>
            <h3 className="font-label-md text-label-md text-primary">{p.nome}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{p.descricao}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {p.formatos.map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={processando === p.id}
                  onClick={() => exportar(p, f)}
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {processando === p.id ? "progress_activity" : "download"}
                  </span>
                  {f}
                </button>
              ))}
            </div>
            {p.requer ? (
              <span className="inline-flex w-fit rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                requer {p.requer}
              </span>
            ) : null}
          </div>
        ))}

        {bloqueados.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-sm rounded-xl border border-dashed border-outline-variant p-md opacity-60"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-surface-container text-outline">
              <span className="material-symbols-outlined">lock</span>
            </span>
            <h3 className="font-label-md text-label-md text-on-surface-variant">{p.nome}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Não contratado neste tenant — depende da feature{" "}
              <code className="font-data-mono">{p.requer}</code>.
            </p>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div className="mt-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Exportações desta sessão
        </h3>
        {jobs.length === 0 ? (
          <p className="p-md font-body-md text-body-md text-on-surface-variant">
            Nenhuma exportação gerada ainda. Escolha um pacote acima.
          </p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="w-24 p-3 font-label-md text-label-md text-on-surface-variant">
                  Hora
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Pacote</th>
                <th className="w-28 p-3 font-label-md text-label-md text-on-surface-variant">
                  Formato
                </th>
                <th className="w-32 p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-surface-container-low">
                  <td className="p-3 font-data-mono text-on-surface-variant">{j.hora}</td>
                  <td className="p-3 text-on-surface">{j.pacote}</td>
                  <td className="p-3 font-data-mono text-on-surface-variant">{j.formato}</td>
                  <td className="p-3 text-right">
                    <StatusBadge tone="ok">{j.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
