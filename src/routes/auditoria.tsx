import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, type Tone } from "@/components/app/StatusBadge";
import { useAuditoria, type TipoEvento } from "@/components/app/AuditoriaContext";
import { usePerfil } from "@/components/app/PerfilContext";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Trilha de auditoria — FinCore ERP" },
      {
        name: "description",
        content: "Log das operações feitas na sessão: CRUD, aprovações e mudanças de feature.",
      },
      { property: "og:title", content: "Trilha de auditoria — FinCore ERP" },
      { property: "og:description", content: "Quem fez, o quê, quando e em qual empresa." },
    ],
  }),
  component: Auditoria,
});

const TIPOS: { id: TipoEvento; nome: string; icone: string; tom: Tone }[] = [
  { id: "crud", nome: "Cadastros e títulos", icone: "edit_note", tom: "info" },
  { id: "aprovacao", nome: "Aprovações", icone: "how_to_reg", tom: "ok" },
  { id: "feature", nome: "Features e parâmetros", icone: "toggle_on", tom: "atencao" },
  { id: "acesso", nome: "Acesso", icone: "login", tom: "neutro" },
  { id: "modulo", nome: "Módulo exclusivo", icone: "workspace_premium", tom: "critico" },
];

function Auditoria() {
  const { eventos } = useAuditoria();
  const { perfil } = usePerfil();

  const [filtro, setFiltro] = useState<TipoEvento | null>(null);
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      eventos.filter((e) => {
        if (filtro && e.tipo !== filtro) return false;
        if (
          busca &&
          !`${e.entidade} ${e.operacao} ${e.detalhe} ${e.usuario} ${e.empresa}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
          return false;
        return true;
      }),
    [eventos, filtro, busca],
  );

  const contagem = (t: TipoEvento) => eventos.filter((e) => e.tipo === t).length;

  const exportar = () => {
    const linhas = [
      "hora;tipo;entidade;operacao;detalhe;usuario;empresa",
      ...lista.map((e) =>
        [e.hora, e.tipo, e.entidade, e.operacao, e.detalhe, e.usuario, e.empresa]
          .map((c) => c.replace(/;/g, ","))
          .join(";"),
      ),
    ].join("\n");
    toast.success(`${lista.length} evento(s) exportado(s)`, {
      description: `Arquivo CSV com ${linhas.split("\n").length - 1} linhas gerado.`,
    });
  };

  return (
    <>
      <PageHeader
        titulo="Trilha de auditoria"
        descricao="Operações registradas nesta sessão. Cada CRUD, aprovação e mudança de feature grava uma linha."
        variabilidade={[
          {
            o_que: "A categoria Módulo exclusivo só aparece quando o módulo de comissões é usado.",
            por: "feature mod_comissoes",
            pv: "PV7",
          },
          {
            o_que: "Todos os perfis leem a trilha; nenhum perfil pode editar ou apagar registros.",
            por: "regra de negócio do núcleo",
            pv: "núcleo",
          },
          {
            o_que: "A coluna Empresa registra o tenant ativo no momento da operação.",
            por: "seletor de empresa",
            pv: "PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{eventos.length} eventos</StatusBadge>
            <button
              type="button"
              disabled={lista.length === 0}
              onClick={exportar}
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportar CSV
            </button>
          </>
        }
      />

      {/* Contadores por tipo */}
      <div className="mb-lg grid grid-cols-2 gap-md lg:grid-cols-5">
        {TIPOS.map((t) => {
          const qtd = contagem(t.id);
          const ativo = filtro === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFiltro(ativo ? null : t.id)}
              className={`rounded-xl border p-md text-left shadow-sm transition-all ${
                ativo
                  ? "border-2 border-secondary bg-secondary/5"
                  : "border-outline-variant bg-surface-container-lowest hover:border-secondary/50"
              }`}
            >
              <span className="mb-1 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">{t.icone}</span>
                <span className="truncate">{t.nome}</span>
              </span>
              <span className="block font-data-mono text-[clamp(1.2rem,3.5vw,1.75rem)] leading-tight text-primary">
                {qtd}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-md py-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Eventos da sessão
            {filtro ? (
              <button
                type="button"
                onClick={() => setFiltro(null)}
                className="ml-3 inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[11px] text-secondary"
              >
                {TIPOS.find((t) => t.id === filtro)?.nome}
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ) : null}
          </h3>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-9 pr-3 font-body-sm text-body-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="Buscar por entidade, operação ou usuário"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {eventos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-lg text-center">
            <span className="material-symbols-outlined text-[40px] text-outline">history_edu</span>
            <p className="font-headline-sm text-headline-sm text-primary">
              Nenhum evento registrado ainda
            </p>
            <p className="max-w-[32rem] font-body-md text-body-md text-on-surface-variant">
              A trilha começa vazia em cada sessão. Cadastre um parceiro, lance um título, aprove um
              pagamento ou ligue/desligue uma feature na tela de configurações — cada ação grava uma
              linha aqui, com o usuário <strong>{perfil.usuario}</strong> e o tenant ativo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="w-24 p-3 font-label-md text-label-md text-on-surface-variant">
                    Hora
                  </th>
                  <th className="w-40 p-3 font-label-md text-label-md text-on-surface-variant">
                    Tipo
                  </th>
                  <th className="w-44 p-3 font-label-md text-label-md text-on-surface-variant">
                    Entidade
                  </th>
                  <th className="w-36 p-3 font-label-md text-label-md text-on-surface-variant">
                    Operação
                  </th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                    Detalhe
                  </th>
                  <th className="w-40 p-3 font-label-md text-label-md text-on-surface-variant">
                    Usuário
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {lista.map((e) => {
                  const tipo = TIPOS.find((t) => t.id === e.tipo);
                  return (
                    <tr key={e.id} className="hover:bg-surface-container-low">
                      <td className="p-3 font-data-mono text-on-surface-variant">{e.hora}</td>
                      <td className="p-3">
                        <StatusBadge tone={tipo?.tom ?? "neutro"}>
                          <span className="material-symbols-outlined text-[14px]">
                            {tipo?.icone}
                          </span>
                          {tipo?.nome ?? e.tipo}
                        </StatusBadge>
                      </td>
                      <td className="p-3 font-label-md text-label-md text-primary">{e.entidade}</td>
                      <td className="p-3 text-on-surface">{e.operacao}</td>
                      <td className="p-3 text-on-surface-variant">{e.detalhe}</td>
                      <td className="p-3">
                        <span className="block text-on-surface">{e.usuario}</span>
                        <span className="block truncate text-[11px] text-outline">{e.empresa}</span>
                      </td>
                    </tr>
                  );
                })}
                {lista.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center font-body-md text-body-md text-on-surface-variant"
                    >
                      Nenhum evento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-outline-variant bg-surface-container-low p-md font-body-sm text-body-sm text-on-surface-variant">
          A trilha é mantida em memória e reinicia ao recarregar a página — no produto real seria
          persistida com retenção de 5 anos e acesso somente leitura para todos os perfis.
        </div>
      </div>
    </>
  );
}
