import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  TODAS_FEATURES,
  useFeatures,
  type AdaptadorBancario,
  type Feature,
  type PerfilProduto,
  type Regime,
} from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Features do tenant — FinCore ERP" },
      {
        name: "description",
        content:
          "Configure as funcionalidades contratadas, o adaptador bancário e o regime tributário do tenant.",
      },
      { property: "og:title", content: "Features do tenant — FinCore ERP" },
      {
        property: "og:description",
        content: "Personalização dinâmica de interface a partir das features ativas.",
      },
    ],
  }),
  component: Configuracoes,
});

const ADAPTADORES: { id: AdaptadorBancario; nome: string; descricao: string }[] = [
  { id: "OFX", nome: "OFX Padrão", descricao: "Formato universal (apenas extratos)" },
  { id: "CNAB240", nome: "Febraban CNAB 240", descricao: "Remessa e retorno detalhado" },
  { id: "CNAB400", nome: "Febraban CNAB 400", descricao: "Remessa e retorno legado" },
];

const REGIMES: Regime[] = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];

/** Matriz Telas × Perfis de produto (Parte III, ponto 4). */
type Grau = "Comum" | "Comum+" | "Opcional" | "Ausente" | "Somente leitura" | "Exclusivo";

const PERFIS_PRODUTO: PerfilProduto[] = ["Essencial", "Profissional", "Corporativo", "Contábil"];

const MATRIZ: { tela: string; graus: Record<PerfilProduto, Grau> }[] = [
  {
    tela: "Dashboard",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Contas a pagar",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Contas a receber",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Clientes e fornecedores",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Plano de contas",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Baixa de pagamento",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum", Contábil: "Ausente" },
  },
  {
    tela: "Relatórios",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Comum+",
    },
  },
  {
    tela: "Importar extrato",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Conciliação bancária",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Fila de aprovação",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Configurar alçada",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Centro de custo",
    graus: {
      Essencial: "Ausente",
      Profissional: "Opcional",
      Corporativo: "Comum",
      Contábil: "Opcional",
    },
  },
  {
    tela: "Rateio de título",
    graus: {
      Essencial: "Ausente",
      Profissional: "Opcional",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Exportar dados",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum+", Contábil: "Comum+" },
  },
  {
    tela: "Notificações",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Opcional",
    },
  },
  {
    tela: "Central de integrações",
    graus: {
      Essencial: "Ausente",
      Profissional: "Ausente",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Comissões",
    graus: {
      Essencial: "Ausente",
      Profissional: "Exclusivo",
      Corporativo: "Ausente",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Assistente de instanciação",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum", Contábil: "Comum" },
  },
];

const corGrau: Record<Grau, string> = {
  Comum: "bg-secondary/10 text-secondary",
  "Comum+": "bg-secondary text-on-secondary",
  Opcional: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  Ausente: "bg-surface-variant text-outline",
  "Somente leitura": "bg-primary-fixed text-on-primary-fixed-variant",
  Exclusivo: "bg-error-container text-on-error-container",
};

function Configuracoes() {
  const { config, has, setFeature, setAdaptador, setRegime } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual, consolidado } = useEmpresa();

  const [aba, setAba] = useState<"features" | "matriz">("features");

  const alternar = (f: Feature, valor: boolean, nome: string, pv: string) => {
    setFeature(f, valor);
    registrar({
      tipo: "feature",
      entidade: "Feature",
      operacao: valor ? "Ativar" : "Desativar",
      detalhe: `${nome} (${f}) ${valor ? "ativada" : "desativada"} — ${pv}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast[valor ? "success" : "info"](`${nome} ${valor ? "ativada" : "desativada"}`, {
      description: "O menu, as colunas e os blocos de formulário reagem imediatamente.",
    });
  };

  const salvarPreferencias = () => {
    registrar({
      tipo: "feature",
      entidade: "Configuração do tenant",
      operacao: "Salvar preferências",
      detalhe: `Adaptador ${config.adaptador} · regime ${config.regime} · ${
        Object.values(config.features).filter(Boolean).length
      } features ativas`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Preferências salvas", {
      description: "Uma linha foi gravada na trilha de auditoria.",
    });
  };

  const ativas = TODAS_FEATURES.filter((f) => has(f.id));

  return (
    <>
      <PageHeader
        titulo="Configurações e variabilidade"
        descricao={`Tenant: ${nomeAtual} · perfil de produto ${config.perfilProduto}. As mudanças valem só para este tenant.`}
        variabilidade={[
          {
            o_que:
              "Cada tenant tem seu próprio conjunto de flags — trocar de empresa troca todo o conjunto.",
            por: "seletor de empresa",
            pv: "PV7",
          },
          {
            o_que:
              "Adaptador bancário e regime tributário são pontos de variação de parâmetro, não de tela.",
            por: "configuração do tenant",
            pv: "PV2 / PV1",
          },
          {
            o_que:
              "Salvar registra uma linha na trilha de auditoria com o usuário e o detalhe da mudança.",
            por: "núcleo",
            pv: "núcleo",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{ativas.length} features ativas</StatusBadge>
            <button
              type="button"
              onClick={salvarPreferencias}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar preferências
            </button>
          </>
        }
      />

      {consolidado ? (
        <div className="mb-md flex items-start gap-3 rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed p-4">
          <span className="material-symbols-outlined text-on-tertiary-fixed-variant">warning</span>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant">
            Você está na <strong>visão consolidada do grupo</strong>. A configuração de features é
            por tenant — selecione uma empresa específica no topo para editar as flags.
          </p>
        </div>
      ) : null}

      {/* Abas */}
      <div className="mb-lg flex border-b border-outline-variant">
        {(
          [
            { id: "features", label: "Funcionalidades" },
            { id: "matriz", label: "Matriz Telas × Perfis de produto" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAba(t.id)}
            className={`border-b-2 px-4 py-3 font-label-md text-label-md transition-colors sm:px-6 ${
              aba === t.id
                ? "border-secondary font-bold text-primary"
                : "border-transparent text-on-surface-variant hover:border-outline-variant hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "features" ? (
        <>
          {/* Banner do P1 */}
          <div className="mb-lg flex items-start gap-4 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 p-4 shadow-sm">
            <span className="material-symbols-outlined mt-0.5 text-secondary">auto_awesome</span>
            <div>
              <h4 className="mb-1 font-label-md text-label-md text-primary">
                Personalização Dinâmica de Interface
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Ao desligar uma funcionalidade abaixo, a interface do FinCore ERP reage
                instantaneamente ocultando os menus laterais, colunas de tabela, relatórios
                específicos e blocos de formulário relacionados. Isso mantém sua área de trabalho
                limpa e focada apenas nas operações que sua empresa utiliza.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-lg">
            {/* Toggles */}
            <div className="col-span-12 flex flex-col gap-md lg:col-span-8">
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                <div className="border-b border-outline-variant bg-surface px-6 py-4">
                  <h3 className="font-label-md text-label-md text-primary">Módulos do sistema</h3>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Ative ou desative grandes módulos operacionais do ERP.
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-outline-variant">
                  {TODAS_FEATURES.map((f) => {
                    const ativo = has(f.id);
                    const exclusiva = f.id === "mod_comissoes";
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-surface-bright"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="mb-1 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface">
                            {f.nome}
                            <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                              {f.pv}
                            </span>
                            <code className="rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-[10px] text-on-surface-variant">
                              {f.id}
                            </code>
                            {exclusiva ? (
                              <span className="rounded-full bg-error-container px-2 py-0.5 font-label-md text-[10px] text-on-error-container">
                                Módulo exclusivo
                              </span>
                            ) : null}
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {f.descricao}
                          </p>
                        </div>
                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            disabled={consolidado}
                            checked={ativo}
                            onChange={(e) => alternar(f.id, e.target.checked, f.nome, f.pv)}
                          />
                          <span className="h-6 w-11 rounded-full bg-surface-variant transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Efeitos imediatos */}
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                <div className="border-b border-outline-variant bg-surface px-6 py-4">
                  <h3 className="font-label-md text-label-md text-primary">
                    O que muda agora na interface
                  </h3>
                </div>
                <ul className="flex flex-col divide-y divide-outline-variant font-body-md text-body-md">
                  {[
                    {
                      on: has("conciliacao"),
                      texto:
                        "Grupo “Conciliação” no menu (Importar extrato + Conciliação bancária) e o relatório Extrato conciliado",
                    },
                    {
                      on: has("alcada"),
                      texto:
                        "Grupo “Aprovações” no menu; sem ele, o título salva direto como Em aberto",
                    },
                    {
                      on: has("centro_custo"),
                      texto:
                        "Grupo “Custos”, coluna Centro de custo em Contas a pagar e bloco de rateio no formulário",
                    },
                    {
                      on: has("multiempresa"),
                      texto: "Seletor de empresas no topo e a visão consolidada do grupo",
                    },
                    {
                      on: has("portal_contador"),
                      texto:
                        "Perfil “Contador externo” no seletor de perfil e o layout de exportação contábil",
                    },
                    {
                      on: has("api_publica"),
                      texto: "Item “Central de integrações” no menu com tokens de API e sandbox",
                    },
                    {
                      on: has("notificacoes_push"),
                      texto:
                        "Canal push nas preferências de notificação e a cobrança por push em Contas a receber",
                    },
                    {
                      on: has("mod_comissoes"),
                      texto: "Item “Comissões” no menu — módulo exclusivo da TransLog Cargas",
                    },
                  ].map((l) => (
                    <li key={l.texto} className="flex items-start gap-3 px-6 py-3">
                      <span
                        className={`material-symbols-outlined mt-0.5 text-[18px] ${l.on ? "text-secondary" : "text-outline"}`}
                      >
                        {l.on ? "visibility" : "visibility_off"}
                      </span>
                      <span className={l.on ? "text-on-surface" : "text-outline line-through"}>
                        {l.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Parâmetros */}
            <div className="col-span-12 flex flex-col gap-md lg:col-span-4">
              {/* Adaptador bancário */}
              <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Adaptador bancário
                  </h3>
                  <span className="ml-auto rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                    PV2
                  </span>
                </div>
                <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
                  Formato de arquivo que o banco principal utiliza para remessa e retorno. Define o
                  parser usado em Importar extrato.
                </p>
                <div className="flex flex-col gap-3">
                  {ADAPTADORES.map((a) => {
                    const ativo = config.adaptador === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        disabled={consolidado}
                        onClick={() => {
                          setAdaptador(a.id);
                          registrar({
                            tipo: "feature",
                            entidade: "Adaptador bancário",
                            operacao: "Alterar",
                            detalhe: `Adaptador definido como ${a.id} (${a.nome})`,
                            usuario: perfil.usuario,
                            empresa: nomeAtual,
                          });
                          toast.success(`Adaptador ${a.id} selecionado`);
                        }}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors disabled:opacity-50 ${
                          ativo
                            ? "border-secondary bg-secondary/5"
                            : "border-outline-variant hover:bg-surface-container"
                        }`}
                      >
                        <span className="flex flex-col">
                          <span
                            className={`font-label-md text-label-md ${ativo ? "text-secondary" : "text-primary"}`}
                          >
                            {a.nome}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {a.descricao}
                          </span>
                        </span>
                        <span
                          className={`material-symbols-outlined shrink-0 ${ativo ? "text-secondary" : "text-outline-variant"}`}
                        >
                          {ativo ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Regime tributário */}
              <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Regime tributário
                  </h3>
                  <span className="ml-auto rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                    PV1
                  </span>
                </div>
                <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
                  Define as contas tributárias sugeridas no plano de contas e a estrutura da DRE.
                </p>
                <div className="flex flex-col gap-2">
                  {REGIMES.map((r) => {
                    const ativo = config.regime === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={consolidado}
                        onClick={() => {
                          setRegime(r);
                          registrar({
                            tipo: "feature",
                            entidade: "Regime tributário",
                            operacao: "Alterar",
                            detalhe: `Regime definido como ${r}`,
                            usuario: perfil.usuario,
                            empresa: nomeAtual,
                          });
                          toast.success(`Regime ${r} selecionado`, {
                            description: "O plano de contas sugerido foi atualizado.",
                          });
                        }}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-left font-label-md text-label-md transition-colors disabled:opacity-50 ${
                          ativo
                            ? "border-secondary bg-secondary/5 text-secondary"
                            : "border-outline-variant text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        {r}
                        {ativo ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumo */}
              <div className="rounded-xl border border-outline-variant bg-surface p-6 shadow-sm">
                <h3 className="mb-3 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Resumo do tenant
                </h3>
                <dl className="flex flex-col gap-2 font-body-sm text-body-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-on-surface-variant">Perfil de produto</dt>
                    <dd className="font-label-md text-primary">{config.perfilProduto}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-on-surface-variant">Adaptador</dt>
                    <dd className="font-data-mono text-on-surface">{config.adaptador}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-on-surface-variant">Regime</dt>
                    <dd className="text-on-surface">{config.regime}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-on-surface-variant">Features ativas</dt>
                    <dd className="font-data-mono text-on-surface">
                      {ativas.length}/{TODAS_FEATURES.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {aba === "matriz" ? (
        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Legenda:</span>
            {(
              [
                ["Comum", "presente em todas as instâncias do perfil"],
                ["Comum+", "presente e enriquecida com blocos extras"],
                ["Opcional", "contratável à parte"],
                ["Ausente", "não faz parte do perfil"],
                ["Somente leitura", "visível sem ações de escrita"],
                ["Exclusivo", "desenvolvida para um único cliente"],
              ] as const
            ).map(([g, desc]) => (
              <span key={g} className="flex items-center gap-1.5" title={desc}>
                <span
                  className={`rounded px-2 py-0.5 font-label-md text-[10px] ${corGrau[g as Grau]}`}
                >
                  {g}
                </span>
              </span>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant bg-surface px-md py-3">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Matriz Telas × Perfis de produto
              </h3>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Grau de presença de cada tela nos quatro perfis comerciais do FinCore. O tenant
                atual usa o perfil{" "}
                <strong className="text-secondary">{config.perfilProduto}</strong>.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low">
                  <tr>
                    <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                      Tela
                    </th>
                    {PERFIS_PRODUTO.map((p) => (
                      <th
                        key={p}
                        className={`p-3 text-center font-label-md text-label-md ${
                          p === config.perfilProduto
                            ? "bg-secondary/10 text-secondary"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {MATRIZ.map((l) => (
                    <tr key={l.tela} className="hover:bg-surface-container-low">
                      <td className="p-3 font-body-md text-body-md text-on-surface">{l.tela}</td>
                      {PERFIS_PRODUTO.map((p) => (
                        <td
                          key={p}
                          className={`p-3 text-center ${p === config.perfilProduto ? "bg-secondary/5" : ""}`}
                        >
                          <span
                            className={`inline-flex whitespace-nowrap rounded px-2 py-0.5 font-label-md text-[10px] ${corGrau[l.graus[p]]}`}
                          >
                            {l.graus[p]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
