import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { TODAS_FEATURES, useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/instanciacao/")({
  head: () => ({
    meta: [
      { title: "Assistente de instanciação — FinCore ERP" },
      {
        name: "description",
        content:
          "Sete etapas para instanciar um tenant: necessidades, features, cobertura, provisão, carga, testes e homologação.",
      },
      { property: "og:title", content: "Assistente de instanciação — FinCore ERP" },
      { property: "og:description", content: "Processo de derivação de uma instância do produto." },
    ],
  }),
  component: Instanciacao,
});

type Resultado = { ok: boolean; titulo: string; detalhes: string[] };

const ETAPAS = [
  {
    id: 1,
    nome: "Levantar necessidades",
    icone: "assignment",
    descricao: "Entrevista de escopo com o cliente e mapeamento dos processos financeiros.",
  },
  {
    id: 2,
    nome: "Selecionar features",
    icone: "checklist",
    descricao: "Marcação das funcionalidades contratadas nos pontos de variação PV1–PV7.",
  },
  {
    id: 3,
    nome: "Verificar cobertura",
    icone: "rule",
    descricao: "Checagem de dependências entre features e das necessidades não cobertas.",
  },
  {
    id: 4,
    nome: "Provisionar tenant",
    icone: "cloud_upload",
    descricao: "Criação do schema isolado, das chaves e do domínio do cliente.",
  },
  {
    id: 5,
    nome: "Carga inicial",
    icone: "database",
    descricao: "Importação do plano de contas, parceiros, centros de custo e saldos de abertura.",
  },
  {
    id: 6,
    nome: "Executar suíte de testes",
    icone: "science",
    descricao: "Testes de fumaça sobre cada feature ativa e os fluxos críticos do núcleo.",
  },
  {
    id: 7,
    nome: "Homologar",
    icone: "verified",
    descricao: "Aceite formal do cliente e liberação do ambiente de produção.",
  },
] as const;

function Instanciacao() {
  const { config, has } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [executando, setExecutando] = useState<number | null>(null);

  const ativas = TODAS_FEATURES.filter((f) => has(f.id));
  const progresso = Math.round((concluidas.length / ETAPAS.length) * 100);

  const gerarResultado = (etapa: number): Resultado => {
    switch (etapa) {
      case 1:
        return {
          ok: true,
          titulo: "12 necessidades levantadas, 12 mapeadas para pontos de variação",
          detalhes: [
            "Regime tributário identificado: " + config.regime + " (PV1)",
            "Banco principal com retorno " + config.adaptador + " (PV2)",
            ativas.some((f) => f.id === "alcada")
              ? "Exige aprovação hierárquica acima de R$ 10.000 (PV3)"
              : "Não exige aprovação hierárquica (PV3 dispensado)",
            ativas.some((f) => f.id === "multiempresa")
              ? "Grupo com múltiplos CNPJs (PV7)"
              : "CNPJ único (PV7 na escala mínima)",
          ],
        };
      case 2:
        return {
          ok: true,
          titulo: `${ativas.length} de ${TODAS_FEATURES.length} features selecionadas`,
          detalhes: ativas.map((f) => `${f.nome} — ${f.pv}`),
        };
      case 3: {
        const problemas: string[] = [];
        if (has("centro_custo") && !has("alcada"))
          problemas.push(
            "Rateio ativo sem alçada: títulos com rateio não passam por aprovação — confirmado pelo cliente.",
          );
        if (has("api_publica") && !has("multiempresa"))
          problemas.push(
            "API pública sem multiempresa: o escopo /v1/empresas retornará 1 registro.",
          );
        if (!has("conciliacao"))
          problemas.push("Sem conciliação: o adaptador bancário fica registrado mas inativo.");
        if (has("mod_comissoes") && !has("centro_custo"))
          problemas.push(
            "Módulo de comissões sem centro de custo: o título gerado não terá rateio departamental.",
          );
        return {
          ok: problemas.length === 0,
          titulo:
            problemas.length === 0
              ? "Cobertura completa — nenhuma dependência pendente"
              : `${problemas.length} observação(ões) de cobertura`,
          detalhes:
            problemas.length === 0
              ? ["Todas as features selecionadas têm suas dependências satisfeitas."]
              : problemas,
        };
      }
      case 4:
        return {
          ok: true,
          titulo: "Tenant provisionado",
          detalhes: [
            `Schema isolado tenant_${nomeAtual
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .slice(0, 24)}`,
            "Domínio: " + nomeAtual.split(" ")[0]?.toLowerCase() + ".fincore.app",
            `Perfil de produto aplicado: ${config.perfilProduto}`,
            has("api_publica")
              ? "Chaves de API geradas (produção + sandbox)"
              : "API pública não provisionada",
          ],
        };
      case 5:
        return {
          ok: true,
          titulo: "Carga inicial concluída",
          detalhes: [
            "Plano de contas: 20 contas base + contas tributárias do regime " + config.regime,
            "Parceiros: 7 registros importados",
            has("centro_custo")
              ? "Centros de custo: 4 registros com rateio padrão"
              : "Centros de custo: não aplicável (feature inativa)",
            "Saldos de abertura conciliados com o balancete de 31/05/2026",
          ],
        };
      case 6: {
        const casos = [
          { nome: "Núcleo — CRUD de parceiro", ok: true },
          { nome: "Núcleo — CRUD de título a pagar", ok: true },
          { nome: "Núcleo — baixa com juros e desconto", ok: true },
          ...(has("alcada") ? [{ nome: "PV3 — título acima da alçada vai à fila", ok: true }] : []),
          ...(has("centro_custo")
            ? [{ nome: "PV7 — rateio bloqueia salvamento fora de 100%", ok: true }]
            : []),
          ...(has("conciliacao")
            ? [{ nome: `PV2/PV6 — parser ${config.adaptador} e conciliação`, ok: true }]
            : []),
          ...(has("multiempresa") ? [{ nome: "PV7 — visão consolidada do grupo", ok: true }] : []),
          ...(has("portal_contador")
            ? [{ nome: "PV4 — perfil contador em modo leitura", ok: true }]
            : []),
          ...(has("api_publica")
            ? [{ nome: "PV7 — autenticação por bearer token", ok: true }]
            : []),
          ...(has("notificacoes_push") ? [{ nome: "PV5 — canal push habilitado", ok: true }] : []),
          ...(has("mod_comissoes")
            ? [{ nome: "Exclusivo — comissão gera título a pagar", ok: true }]
            : []),
        ];
        return {
          ok: casos.every((c) => c.ok),
          titulo: `${casos.filter((c) => c.ok).length}/${casos.length} casos aprovados`,
          detalhes: casos.map((c) => `${c.ok ? "PASS" : "FAIL"} · ${c.nome}`),
        };
      }
      case 7:
        return {
          ok: true,
          titulo: "Tenant homologado",
          detalhes: [
            `Aceite registrado por ${perfil.usuario} (${perfil.nome})`,
            `Perfil de produto ${config.perfilProduto} com ${ativas.length} features ativas`,
            "Ficha de configuração disponível em /instanciacao/resumo",
            "Ambiente liberado para produção",
          ],
        };
      default:
        return { ok: true, titulo: "", detalhes: [] };
    }
  };

  const executar = (etapa: number) => {
    setExecutando(etapa);
    window.setTimeout(() => {
      const resultado = gerarResultado(etapa);
      setResultados((r) => ({ ...r, [etapa]: resultado }));
      setConcluidas((c) => (c.includes(etapa) ? c : [...c, etapa]));
      setExecutando(null);
      registrar({
        tipo: "feature",
        entidade: "Instanciação",
        operacao: `Etapa ${etapa}`,
        detalhe: `${ETAPAS[etapa - 1]?.nome}: ${resultado.titulo}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast[resultado.ok ? "success" : "warning"](`Etapa ${etapa} — ${ETAPAS[etapa - 1]?.nome}`, {
        description: resultado.titulo,
      });
    }, 700);
  };

  const executarTudo = () => {
    ETAPAS.forEach((e, i) => {
      window.setTimeout(() => executar(e.id), i * 850);
    });
  };

  return (
    <>
      <PageHeader
        titulo="Assistente de instanciação"
        descricao={`Derivação de uma instância do FinCore para ${nomeAtual}. Sete etapas, com resultado por etapa.`}
        variabilidade={[
          {
            o_que: "A etapa 2 lista exatamente as features ativas do tenant selecionado.",
            por: "FeaturesContext do tenant",
            pv: "PV1–PV7",
          },
          {
            o_que:
              "A etapa 3 acusa dependências entre features (ex.: rateio sem alçada, API sem multiempresa).",
            por: "combinação de features",
            pv: "PV7",
          },
          {
            o_que:
              "A suíte de testes da etapa 6 cresce com as features: só testa o que foi contratado.",
            por: "features do tenant",
            pv: "PV1–PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone={progresso === 100 ? "ok" : "atencao"}>
              {concluidas.length}/{ETAPAS.length} etapas
            </StatusBadge>
            <button
              type="button"
              onClick={executarTudo}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Executar todas
            </button>
            <button
              type="button"
              onClick={() => {
                setConcluidas([]);
                setResultados({});
              }}
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reiniciar
            </button>
          </>
        }
      />

      {/* Barra de progresso */}
      <div className="mb-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Progresso da instanciação
          </span>
          <span className="font-data-mono text-data-mono font-bold text-secondary">
            {progresso}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-variant">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
        {progresso === 100 ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-secondary/10 p-3">
            <span className="material-symbols-outlined text-secondary">verified</span>
            <p className="flex-1 font-body-md text-body-md text-on-surface">
              Instanciação concluída. A ficha de configuração já reflete todas as decisões tomadas.
            </p>
            <Link
              to="/instanciacao/resumo"
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-label-md text-label-md text-on-secondary"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              Ver ficha de configuração
            </Link>
          </div>
        ) : null}
      </div>

      {/* Etapas */}
      <div className="flex flex-col gap-md">
        {ETAPAS.map((e) => {
          const feito = concluidas.includes(e.id);
          const rodando = executando === e.id;
          const resultado = resultados[e.id];
          const liberada = e.id === 1 || concluidas.includes(e.id - 1);

          return (
            <div
              key={e.id}
              className={`overflow-hidden rounded-xl border shadow-sm transition-all ${
                feito
                  ? resultado?.ok
                    ? "border-secondary/50 bg-surface-container-lowest"
                    : "border-tertiary-fixed-dim bg-surface-container-lowest"
                  : "border-outline-variant bg-surface-container-lowest"
              } ${liberada ? "" : "opacity-60"}`}
            >
              <div className="flex flex-wrap items-center gap-4 p-md">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full font-label-md text-label-md ${
                    feito
                      ? "bg-secondary text-on-secondary"
                      : rodando
                        ? "bg-primary text-on-primary ring-4 ring-primary-fixed"
                        : "border-2 border-outline-variant bg-surface text-on-surface-variant"
                  }`}
                >
                  {feito ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : rodando ? (
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    e.id
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-headline-sm text-headline-sm text-primary">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                      {e.icone}
                    </span>
                    {e.nome}
                  </h3>
                  <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                    {e.descricao}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {feito ? (
                    <StatusBadge tone={resultado?.ok ? "ok" : "atencao"}>
                      {resultado?.ok ? "Concluída" : "Com observações"}
                    </StatusBadge>
                  ) : (
                    <button
                      type="button"
                      disabled={!liberada || rodando}
                      onClick={() => executar(e.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      Executar
                    </button>
                  )}
                </div>
              </div>

              {resultado ? (
                <div className="border-t border-outline-variant bg-surface p-md">
                  <p
                    className={`mb-2 flex items-center gap-2 font-label-md text-label-md ${
                      resultado.ok ? "text-secondary" : "text-on-tertiary-fixed-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {resultado.ok ? "check_circle" : "warning"}
                    </span>
                    {resultado.titulo}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {resultado.detalhes.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-outline-variant" />
                        <span
                          className={
                            d.startsWith("PASS")
                              ? "font-data-mono text-secondary"
                              : d.startsWith("FAIL")
                                ? "font-data-mono text-error"
                                : ""
                          }
                        >
                          {d}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
