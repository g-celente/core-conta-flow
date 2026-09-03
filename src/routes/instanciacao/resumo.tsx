import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { TODAS_FEATURES, useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil, PERFIS } from "@/components/app/PerfilContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { empresas } from "@/lib/mock-data";

export const Route = createFileRoute("/instanciacao/resumo")({
  head: () => ({
    meta: [
      { title: "Ficha de configuração do tenant — FinCore ERP" },
      {
        name: "description",
        content: "Resumo dos pontos de variação PV1–PV7 com o valor configurado para o tenant.",
      },
      { property: "og:title", content: "Ficha de configuração do tenant — FinCore ERP" },
      {
        property: "og:description",
        content: "Perfil de produto, features ativas e decisões de variabilidade.",
      },
    ],
  }),
  component: Resumo,
});

function Resumo() {
  const { config, has, todas } = useFeatures();
  const { perfil } = usePerfil();
  const { nomeAtual, empresaId, consolidado } = useEmpresa();

  const empresa = empresas.find((e) => e.id === empresaId);
  const ativas = TODAS_FEATURES.filter((f) => has(f.id));

  /** Tabela PV1–PV7 gerada a partir do FeaturesContext. */
  const PVS = [
    {
      pv: "PV1",
      nome: "Regime tributário",
      tipo: "Parâmetro",
      valor: config.regime,
      efeito: "Define as contas tributárias sugeridas no plano de contas e a estrutura da DRE.",
      telas: "/onboarding, /plano-de-contas, /relatorios",
    },
    {
      pv: "PV2",
      nome: "Adaptador bancário",
      tipo: "Parâmetro",
      valor: config.adaptador,
      efeito: "Define a extensão aceita e o parser usado na leitura do arquivo bancário.",
      telas: "/importar-extrato, /integracoes/adaptador",
    },
    {
      pv: "PV3",
      nome: "Aprovação por alçada",
      tipo: "Feature",
      valor: has("alcada") ? "Ativa" : "Inativa",
      efeito: has("alcada")
        ? "Títulos acima de R$ 10.000 vão para a fila de aprovação."
        : "Todo título é salvo direto como “Em aberto”; grupo Aprovações oculto no menu.",
      telas: "/aprovacoes, /alcadas, /contas-a-pagar",
    },
    {
      pv: "PV4",
      nome: "Portal do contador",
      tipo: "Feature",
      valor: has("portal_contador") ? "Ativa" : "Inativa",
      efeito: has("portal_contador")
        ? "Perfil Contador externo disponível no seletor e layout de exportação contábil habilitado."
        : "Perfil Contador externo oculto no seletor de perfil.",
      telas: "/relatorios, /exportacoes, seletor de perfil",
    },
    {
      pv: "PV5",
      nome: "Notificações push",
      tipo: "Feature",
      valor: has("notificacoes_push") ? "Ativa" : "Inativa",
      efeito: has("notificacoes_push")
        ? "Canal Push nas preferências e cobrança por push em Contas a receber."
        : "Apenas e-mail e in-app; coluna Push ausente.",
      telas: "/notificacoes, /contas-a-receber",
    },
    {
      pv: "PV6",
      nome: "Conciliação bancária",
      tipo: "Feature",
      valor: has("conciliacao") ? "Ativa" : "Inativa",
      efeito: has("conciliacao")
        ? "Importação de extrato e conciliação disponíveis; relatório Extrato conciliado habilitado."
        : "Grupo Conciliação oculto no menu; adaptador registrado mas inativo.",
      telas: "/importar-extrato, /conciliacao, /relatorios",
    },
    {
      pv: "PV7",
      nome: "Escala e extensões",
      tipo: "Composto",
      valor:
        [
          has("centro_custo") ? "centro_custo" : null,
          has("multiempresa") ? "multiempresa" : null,
          has("api_publica") ? "api_publica" : null,
          has("mod_comissoes") ? "mod_comissoes" : null,
        ]
          .filter(Boolean)
          .join(", ") || "nenhuma",
      efeito:
        "Centro de custo adiciona coluna, filtro e rateio; multiempresa habilita o seletor e a visão consolidada; API pública abre a central de integrações; mod_comissoes registra o módulo exclusivo.",
      telas: "/centros-de-custo, /rateio, /integracoes, /comissoes, dashboard",
    },
  ];

  const corTipo: Record<string, string> = {
    Parâmetro: "bg-primary-fixed text-on-primary-fixed-variant",
    Feature: "bg-secondary/10 text-secondary",
    Composto: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  };

  return (
    <>
      <PageHeader
        titulo="Ficha de configuração do tenant"
        descricao={`Documento gerado a partir do FeaturesContext em tempo real para ${nomeAtual}.`}
        variabilidade={[
          {
            o_que:
              "Toda a ficha é derivada do FeaturesContext — mudar uma flag na tela 13 muda esta página.",
            por: "FeaturesContext do tenant",
            pv: "PV1–PV7",
          },
          {
            o_que:
              "A coluna Valor configurado mostra parâmetros (regime, adaptador) e features (ativa/inativa).",
            por: "configuração do tenant",
            pv: "PV1–PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{config.perfilProduto}</StatusBadge>
            <Link
              to="/configuracoes"
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Editar features
            </Link>
          </>
        }
      />

      {/* Identificação */}
      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            rotulo: "Tenant",
            valor: consolidado ? "Visão consolidada" : (empresa?.nome ?? nomeAtual),
            icone: "domain",
          },
          {
            rotulo: "CNPJ",
            valor: consolidado ? "múltiplos" : (empresa?.cnpj ?? "—"),
            icone: "badge",
            mono: true,
          },
          { rotulo: "Perfil de produto", valor: config.perfilProduto, icone: "workspaces" },
          {
            rotulo: "Features ativas",
            valor: `${ativas.length} de ${TODAS_FEATURES.length}`,
            icone: "toggle_on",
            mono: true,
          },
        ].map((c) => (
          <div
            key={c.rotulo}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm"
          >
            <p className="mb-1 flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">{c.icone}</span>
              {c.rotulo}
            </p>
            <p
              className={`text-body-lg text-primary ${c.mono ? "font-data-mono" : "font-body-lg font-semibold"}`}
            >
              {c.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela PV1–PV7 */}
      <div className="mb-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant bg-surface px-md py-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Pontos de variação PV1–PV7
          </h3>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Valor configurado e efeito prático na instância deste tenant.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="w-16 p-3 font-label-md text-label-md text-on-surface-variant">PV</th>
                <th className="w-44 p-3 font-label-md text-label-md text-on-surface-variant">
                  Ponto de variação
                </th>
                <th className="w-28 p-3 font-label-md text-label-md text-on-surface-variant">
                  Tipo
                </th>
                <th className="w-44 p-3 font-label-md text-label-md text-on-surface-variant">
                  Valor configurado
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Efeito na instância
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {PVS.map((p) => (
                <tr key={p.pv} className="hover:bg-surface-container-low">
                  <td className="p-3 font-data-mono text-data-mono font-bold text-secondary">
                    {p.pv}
                  </td>
                  <td className="p-3 font-label-md text-label-md text-primary">{p.nome}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 font-label-md text-[10px] ${corTipo[p.tipo]}`}
                    >
                      {p.tipo}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block font-data-mono text-body-sm text-on-surface">
                      {p.valor}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">
                      {p.efeito}
                    </span>
                    <span className="mt-1 block font-data-mono text-[11px] text-outline">
                      {p.telas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        {/* Features ativas */}
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
            Features contratadas
          </h3>
          <ul className="flex flex-col divide-y divide-outline-variant">
            {TODAS_FEATURES.map((f) => {
              const ativo = has(f.id);
              return (
                <li key={f.id} className="flex items-center gap-3 px-md py-2.5">
                  <span
                    className={`material-symbols-outlined text-[20px] ${ativo ? "text-secondary" : "text-outline"}`}
                  >
                    {ativo ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-label-md text-label-md ${ativo ? "text-on-surface" : "text-outline"}`}
                    >
                      {f.nome}
                    </span>
                    <code className="block font-data-mono text-[11px] text-on-surface-variant">
                      {f.id}
                    </code>
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                    {f.pv}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Perfis de acesso */}
        <div className="flex flex-col gap-lg">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
              Perfis de acesso habilitados
            </h3>
            <ul className="flex flex-col divide-y divide-outline-variant">
              {PERFIS.map((p) => {
                const habilitado = p.id !== "contador" || has("portal_contador");
                return (
                  <li key={p.id} className="flex items-start gap-3 px-md py-2.5">
                    <span
                      className={`material-symbols-outlined mt-0.5 text-[20px] ${habilitado ? "text-secondary" : "text-outline"}`}
                    >
                      {habilitado ? "person_check" : "person_off"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-label-md text-label-md ${habilitado ? "text-on-surface" : "text-outline"}`}
                      >
                        {p.nome}
                        {p.id === perfil.id ? (
                          <span className="ml-2 rounded-full bg-primary-fixed px-2 py-0.5 font-label-md text-[10px] text-on-primary-fixed-variant">
                            sessão atual
                          </span>
                        ) : null}
                      </span>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">
                        {habilitado
                          ? `${p.usuario} · ${p.rotas === null ? "acesso total" : `${p.rotas.length} rotas`}${p.somenteLeitura ? " · somente leitura" : ""}`
                          : "Indisponível — requer portal_contador (PV4)"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Comparativo com os outros tenants */}
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
              Perfis de produto do grupo
            </h3>
            <ul className="flex flex-col divide-y divide-outline-variant">
              {empresas.map((e) => {
                const c = todas[e.id];
                const atual = e.id === empresaId;
                return (
                  <li
                    key={e.id}
                    className={`flex flex-wrap items-center justify-between gap-2 px-md py-2.5 ${atual ? "bg-secondary/5" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-body-md text-body-md text-on-surface">
                        {e.nome}
                      </span>
                      <span className="block font-data-mono text-[11px] text-on-surface-variant">
                        {c ? Object.values(c.features).filter(Boolean).length : 0} features ·{" "}
                        {c?.adaptador} · {c?.regime}
                      </span>
                    </span>
                    <StatusBadge tone={atual ? "ok" : "neutro"}>
                      {c?.perfilProduto ?? "—"}
                    </StatusBadge>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
